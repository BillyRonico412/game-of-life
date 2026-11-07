import { match } from "ts-pattern"
import type { Dimension, Position } from "@/lib/jotai"
import type { GameOfLife } from "@/lib/logic"

export class Cpu implements GameOfLife {
	grid1: Uint32Array<ArrayBuffer>
	grid2: Uint32Array<ArrayBuffer>
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	currentGridId: "one" | "two" = "one"
	gameDimension: Dimension

	constructor(canvas: HTMLCanvasElement, gameDimension: Dimension) {
		const ctx = canvas.getContext("2d")
		if (!ctx) {
			throw new Error("No ctx 2d")
		}
		this.canvas = canvas
		this.ctx = ctx
		this.gameDimension = gameDimension
		this.grid1 = new Uint32Array(
			this.gameDimension.width * this.gameDimension.height,
		)
		this.grid2 = new Uint32Array(
			this.gameDimension.width * this.gameDimension.height,
		)
	}

	draw(start: Position, dimension: Dimension): void {
		if (!this.ctx) {
			throw new Error("No context")
		}
		const cellSize = this.canvas.width / dimension.width
		const currentGrid = this.currentGrid

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		for (let j = 0; j < dimension.height; j++) {
			for (let i = 0; i < dimension.width; i++) {
				const index = (start.y + j) * this.gameDimension.width + start.x + i
				const state = currentGrid[index]
				if (state) {
					this.ctx.fillStyle = "#000"
					this.ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
				}
			}
		}
	}

	setGame(grid: Uint32Array<ArrayBuffer>): void {
		if (grid.length !== this.gameDimension.width * this.gameDimension.height) {
			throw new Error("Invalid grid size")
		}
		switch (this.currentGridId) {
			case "one": {
				this.grid1 = grid
				break
			}
			case "two": {
				this.grid2 = grid
				break
			}
		}
	}

	step(): number {
		for (let i = 0; i < this.gameDimension.width; i++) {
			for (let j = 0; j < this.gameDimension.height; j++) {
				const index = this.gameDimension.width * j + i
				const nbNeighboors = this.getNbNeighboors(this.currentGrid, index)
				const cell = this.currentGrid[index]
				let newCell = cell
				if (cell === 1 && (nbNeighboors < 2 || nbNeighboors > 3)) {
					newCell = 0
				} else if (cell === 0 && nbNeighboors === 3) {
					newCell = 1
				}
				this.nextGrid[index] = newCell
			}
		}
		this.currentGridId = this.currentGridId === "one" ? "two" : "one"
		return Date.now()
	}

	get currentGrid(): Uint32Array<ArrayBuffer> {
		return match(this.currentGridId)
			.with("one", () => this.grid1)
			.with("two", () => this.grid2)
			.exhaustive()
	}

	get nextGrid(): Uint32Array<ArrayBuffer> {
		return match(this.currentGridId)
			.with("one", () => this.grid2)
			.with("two", () => this.grid1)
			.exhaustive()
	}

	getNbNeighboors(grid: Uint32Array<ArrayBuffer>, index: number): number {
		const width = this.gameDimension.width
		const height = this.gameDimension.height
		const x = index % width
		const y = Math.floor(index / width)
		let count = 0
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue
				const nx = x + dx
				const ny = y + dy
				if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
					count += grid[ny * width + nx]
				}
			}
		}
		return count
	}

	clear() {}
}
