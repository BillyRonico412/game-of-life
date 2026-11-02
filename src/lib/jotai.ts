import { atom, createStore } from "jotai"
import { atomEffect, withAtomEffect } from "jotai-effect"
import type React from "react"
import { Cpu } from "@/lib/cpu"
import type { GameOfLife } from "@/lib/logic"

export type Dimension = { width: number; height: number }
export type Position = { x: number; y: number }

const widthToHeight = (width: number, ratio: number) => {
	return Math.floor(width * ratio)
}

const heightToWidth = (height: number, ratio: number) => {
	return Math.floor(height / ratio)
}

const gameDimensionAtom = atom<Dimension>({ width: 600, height: 400 })
const ratioAtom = atom((get) => {
	const gameDimension = get(gameDimensionAtom)
	return gameDimension.height / gameDimension.width
})

const generationTimeAtom = atom(200)

const playAtom = atom(false)

const zoomWidthAtom = atom<number>(600)
const zoomHeightAtom = atom((get) => {
	const ratio = get(ratioAtom)
	const zoomWidth = get(zoomWidthAtom)
	return widthToHeight(zoomWidth, ratio)
})

const setZoomHeightAtom = atom(null, (get, set, newZoomHeight: number) => {
	const ratio = get(ratioAtom)
	const newZoomWidth = heightToWidth(newZoomHeight, ratio)
	set(zoomWidthAtom, newZoomWidth)
})

const zoomPositionAtom = atom<Position>({ x: 0, y: 0 })

const maxZoomWidthAtom = atom((get) => {
	const gameDimension = get(gameDimensionAtom)
	const ratio = get(ratioAtom)
	if (gameDimension.width < gameDimension.height) {
		return gameDimension.width
	} else {
		return heightToWidth(gameDimension.height, ratio)
	}
})

const canvasDimensionAtom = withAtomEffect(
	atom<Dimension>({ width: 0, height: 0 }),
	(get, set) => {
		const handler = () => {
			const gridCanvas = document.querySelector("#grid") as
				| HTMLCanvasElement
				| undefined
			const gameOfLifeCanvas = document.querySelector("#game-of-life") as
				| HTMLCanvasElement
				| undefined
			const minimapCanvas = document.querySelector("#minimap") as
				| HTMLCanvasElement
				| undefined
			if (!gridCanvas || !gameOfLifeCanvas || !minimapCanvas) {
				throw new Error("Some canvas is undefined")
			}
			const screenWidth = document.body.clientWidth
			const screenHeight = document.body.clientHeight
			gridCanvas.width = screenWidth
			gridCanvas.height = screenHeight
			gameOfLifeCanvas.width = screenWidth
			gameOfLifeCanvas.height = screenHeight

			set(canvasDimensionAtom, { width: screenWidth, height: screenHeight })
			const maxZoomWidth = get.peek(maxZoomWidthAtom)
			set(zoomWidthAtom, maxZoomWidth)
		}
		handler()
		window.addEventListener("resize", handler)
		return () => {
			window.removeEventListener("resize", handler)
		}
	},
)

const nbCellsAtom = atom((get) => {
	const gameDimension = get(gameDimensionAtom)
	return gameDimension.width * gameDimension.height
})

const drawGridEffect = atomEffect((get) => {
	// const canvas = document.querySelector("#grid") as
	// 	| HTMLCanvasElement
	// 	| undefined
	// if (!canvas) {
	// 	throw new Error("No canvas")
	// }
	// const cellSize = get(cellSizeAtom)
	// const cellsDimension = get(cellsDimensionAtom)
	// const canvasDimension = get(canvasDimensionAtom)
	// const ctx = canvas.getContext("2d")
	// if (!ctx) {
	// 	throw new Error("No context")
	// }
	// ctx.clearRect(0, 0, canvasDimension.width, canvasDimension.height)
	// ctx.beginPath()
	// for (let i = 0; i < cellsDimension.width; i++) {
	// 	ctx.moveTo(i * cellSize, 0)
	// 	ctx.lineTo(i * cellSize, canvasDimension.height)
	// }
	// for (let i = 0; i < cellsDimension.height; i++) {
	// 	ctx.moveTo(0, i * cellSize)
	// 	ctx.lineTo(canvasDimension.width, i * cellSize)
	// }
	// ctx.lineWidth = 1
	// ctx.strokeStyle = "#0002"
	// ctx.stroke()
})

const gameOfLifeAtom = atom((get): GameOfLife | undefined => {
	get(canvasDimensionAtom)
	const canvas = document.querySelector("#grid") as
		| HTMLCanvasElement
		| undefined
	if (!canvas) {
		return
	}
	const gameDimension = get(gameDimensionAtom)
	const zoomPosition = get(zoomPositionAtom)
	const zoomWidth = get(zoomWidthAtom)
	const gameOfLife = new Cpu(canvas, gameDimension)
	gameOfLife.draw(zoomWidth, zoomPosition)
	return gameOfLife
})

const getRandomGridAtom = atom(null, (get, _, aliveRatio: number = 0.5) => {
	const gameDimension = get(gameDimensionAtom)
	const grid = new Uint8Array(gameDimension.width * gameDimension.height)
	for (let j = 0; j < gameDimension.height; j++) {
		for (let i = 0; i < gameDimension.width; i++) {
			grid[j * gameDimension.width + i] = Number(Math.random() < aliveRatio)
		}
	}
	return grid
})

const playEffect = atomEffect((get) => {
	const generationTime = get(generationTimeAtom)
	const gameOfLife = get(gameOfLifeAtom)
	const play = get(playAtom)
	if (!gameOfLife || !play) {
		return
	}
	const playInterval = window.setInterval(() => {
		gameOfLife.step()
	}, generationTime)
	return () => {
		window.clearInterval(playInterval)
	}
})

const MAX_MINIMAX_SIZE = 300

const minimapEffect = atomEffect((get) => {
	const minimapCanvas = document.querySelector("#minimap") as
		| HTMLCanvasElement
		| undefined
	if (!minimapCanvas) {
		throw new Error("Some canvas is undefined")
	}

	const gameDimension = get(gameDimensionAtom)

	if (gameDimension.width < gameDimension.height) {
		minimapCanvas.height = MAX_MINIMAX_SIZE
		minimapCanvas.width =
			(gameDimension.width / gameDimension.height) * MAX_MINIMAX_SIZE
	} else {
		minimapCanvas.width = MAX_MINIMAX_SIZE
		minimapCanvas.height =
			(gameDimension.height / gameDimension.width) * MAX_MINIMAX_SIZE
	}

	const ctx = minimapCanvas.getContext("2d")
	if (!ctx) {
		throw new Error("No context 2d")
	}

	const widthRatio = minimapCanvas.width / gameDimension.width
	const heightRatio = minimapCanvas.height / gameDimension.height

	const zoomWidth = get(zoomWidthAtom)
	const zoomHeigt = get(zoomHeightAtom)

	const zoomPosition = get(zoomPositionAtom)

	ctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height)

	ctx.fillStyle = "#8888"
	ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height)

	ctx.fillStyle = "#F808"
	ctx.fillRect(
		zoomPosition.x * widthRatio,
		zoomPosition.y * heightRatio,
		zoomWidth * widthRatio,
		zoomHeigt * heightRatio,
	)
})

let isPanning = false
let last: Position | undefined
let positionWhenStart: Position | undefined

const onMouseDownAtom = atom(null, (get, _, e: React.MouseEvent) => {
	const zoomPosition = get(zoomPositionAtom)
	isPanning = true
	last = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
	positionWhenStart = structuredClone(zoomPosition)
})

const onMouseUpAtom = atom(null, () => {
	isPanning = false
	last = undefined
	positionWhenStart = undefined
})

const onMouseMoveAtom = atom(null, (get, set, e: React.MouseEvent) => {
	if (!isPanning || !last || !positionWhenStart) {
		return
	}

	const zoomPosition = get(zoomPositionAtom)
	const zoomWidth = get(zoomWidthAtom)
	const zoomHeight = get(zoomHeightAtom)
	const gameDimension = get(gameDimensionAtom)

	const current: Position = {
		x: e.nativeEvent.offsetX,
		y: e.nativeEvent.offsetY,
	}

	const delta: Position = {
		x: current.x - last.x,
		y: current.y - last.y,
	}

	last = current

	const newPosition: Position = {
		x: Math.min(
			Math.max(zoomPosition.x - delta.x, 0),
			gameDimension.width - zoomWidth,
		),
		y: Math.min(
			Math.max(zoomPosition.y - delta.y, 0),
			gameDimension.height - zoomHeight,
		),
	}

	set(zoomPositionAtom, newPosition)
})

const ZOOM_SENSITIVITY = 0.0015

const onWheelAtom = atom(null, (get, set, e: React.WheelEvent) => {
	const zoomWidth = get(zoomWidthAtom)
	const zoomHeight = get(zoomHeightAtom)
	const zoomPosition = get(zoomPositionAtom)
	const gameDimension = get(gameDimensionAtom)
	const maxZoomWidth = get(maxZoomWidthAtom)
	const ratio = get(ratioAtom)

	const deltaPx = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
	const zoomFactor = Math.exp(deltaPx * ZOOM_SENSITIVITY)

	const newZoomWidth = Math.floor(
		Math.min(Math.max(zoomWidth * zoomFactor, 1), maxZoomWidth),
	)

	if (newZoomWidth < 10) {
		return
	}

	const newZoomHeight = Math.floor(
		Math.min(widthToHeight(newZoomWidth, ratio), gameDimension.height),
	)
	if (newZoomHeight <= 0) {
		return
	}

	const newPosition: Position = {
		x: Math.min(
			Math.max(zoomPosition.x + (zoomWidth - newZoomWidth) / 2, 0),
			gameDimension.width - newZoomWidth,
		),
		y: Math.min(
			Math.max(zoomPosition.y + (zoomHeight - newZoomHeight) / 2, 0),
			gameDimension.height - newZoomHeight,
		),
	}

	set(zoomWidthAtom, newZoomWidth)
	set(zoomPositionAtom, newPosition)
})

export const atoms = {
	generationTimeAtom,
	canvasDimensionAtom,
	nbCellsAtom,
	drawGridEffect,
	gameOfLifeAtom,
	getRandomGridAtom,
	playEffect,
	playAtom,
	minimapEffect,
	onMouseDownAtom,
	onMouseUpAtom,
	onMouseMoveAtom,
	gameDimensionAtom,
	zoomWidthAtom,
	zoomHeightAtom,
	onWheelAtom,
}

export const jotaiStore = createStore()
