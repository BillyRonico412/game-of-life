import type { Dimension, Position } from "@/lib/jotai"

export interface GameOfLife {
	setGame(grid: Uint8Array): void
	step(): void
	draw(start: Position, dimension: Dimension): void
}
