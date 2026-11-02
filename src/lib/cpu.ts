import { match } from "ts-pattern"
import type { Dimension, Position } from "@/lib/jotai"
import type { GameOfLife } from "@/lib/logic"

export class Cpu implements GameOfLife {
	grid1: Uint8Array<ArrayBuffer>
	grid2: Uint8Array<ArrayBuffer>
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	currentGridId: "one" | "two" = "one"
	gameSize: Dimension

	constructor(canvas: HTMLCanvasElement, gameSize: Dimension) {
		const ctx = canvas.getContext("2d")
		if (!ctx) {
			throw new Error("No ctx 2d")
		}
		this.canvas = canvas
		this.ctx = ctx
		this.gameSize = gameSize
		this.grid1 = new Uint8Array(this.gameSize.width * this.gameSize.height)
		this.grid2 = new Uint8Array(this.gameSize.width * this.gameSize.height)
	}

	draw(zoomWidth: number, zoomPosition: Position): void {
		if (!this.ctx) {
			throw new Error("No context")
		}
		const currentGrid = this.currentGrid
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.ctx.beginPath()
		this.ctx.fillStyle = "#000F"
	}

	setGame(grid: Uint8Array<ArrayBuffer>): void {
		if (grid.length !== this.gameSize.width * this.gameSize.height) {
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

	step(): void {
		for (let i = 0; i < this.gameSize.width; i++) {
			for (let j = 0; j < this.gameSize.height; j++) {
				const index = this.gameSize.width * j + i
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
	}

	get currentGrid(): Uint8Array<ArrayBuffer> {
		return match(this.currentGridId)
			.with("one", () => this.grid1)
			.with("two", () => this.grid2)
			.exhaustive()
	}

	get nextGrid(): Uint8Array<ArrayBuffer> {
		return match(this.currentGridId)
			.with("one", () => this.grid2)
			.with("two", () => this.grid1)
			.exhaustive()
	}

	getNbNeighboors(grid: Uint8Array<ArrayBuffer>, index: number): number {
		const width = this.gameSize.width
		const height = this.gameSize.height
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
}
