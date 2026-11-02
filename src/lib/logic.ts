import type { Position } from "@/lib/jotai"

export interface GameOfLife {
	setGame(grid: Uint8Array): void
	step(): void
	draw(zoomWidth: number, position: Position): void
}
