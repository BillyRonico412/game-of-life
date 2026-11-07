import type { Dimension, Position } from "@/lib/jotai"

export interface GameOfLife {
	setGame(grid: Uint32Array): void
	step(): number
	draw(start: Position, dimension: Dimension): void
}
