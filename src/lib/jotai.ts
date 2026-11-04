import { atom, createStore } from "jotai"
import { atomEffect, withAtomEffect } from "jotai-effect"
import type React from "react"
import { Cpu } from "@/lib/cpu"
import type { GameOfLife } from "@/lib/logic"

export type Dimension = { width: number; height: number }
export type Position = { x: number; y: number }

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max)

const gameDimensionAtom = atom<Dimension>({ width: 800, height: 600 })

const generationTimeAtom = atom(200)

const playAtom = atom(false)

const minimapWidthAtom = atom<number>(600)

const minimapHeightAtom = atom((get) => {
	const minimapWidth = get(minimapWidthAtom)
	const canvasDimension = get(canvasDimensionAtom)
	return Math.floor(
		(minimapWidth * canvasDimension.height) / canvasDimension.width,
	)
})

const minimapPositionAtom = atom<Position>({ x: 0, y: 0 })
const minimapPositionFloorAtom = atom((get) => {
	const minimapPosition = get(minimapPositionAtom)
	return {
		x: Math.floor(minimapPosition.x),
		y: Math.floor(minimapPosition.y),
	}
})

const maxMinimapWidthAtom = atom((get) => {
	const gameDimension = get(gameDimensionAtom)
	const canvasDimension = get(canvasDimensionAtom)

	const maxWidthWhenWidthLimited = gameDimension.width
	const maxWidthWhenHeightLimited = Math.floor(
		(gameDimension.height * canvasDimension.width) / canvasDimension.height,
	)

	return Math.min(maxWidthWhenWidthLimited, maxWidthWhenHeightLimited)
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
			const maxMinimapWidth = get.peek(maxMinimapWidthAtom)
			set(minimapWidthAtom, maxMinimapWidth)
			set(drawAtom)
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

const cellSizeAtom = atom((get) => {
	const minimapWidth = get(minimapWidthAtom)
	const canvasDimension = get(canvasDimensionAtom)
	return canvasDimension.width / minimapWidth
})

const drawGridEffect = atomEffect((get) => {
	const canvas = document.querySelector("#grid") as
		| HTMLCanvasElement
		| undefined
	if (!canvas) {
		throw new Error("No canvas")
	}
	const minimapWidth = get(minimapWidthAtom)
	const minimapHeight = get(minimapHeightAtom)
	const cellSize = get(cellSizeAtom)
	const canvasDimension = get(canvasDimensionAtom)
	const ctx = canvas.getContext("2d")
	if (!ctx) {
		throw new Error("No context")
	}
	ctx.clearRect(0, 0, canvasDimension.width, canvasDimension.height)
	ctx.beginPath()
	for (let i = 0; i < minimapWidth; i++) {
		ctx.moveTo(i * cellSize, 0)
		ctx.lineTo(i * cellSize, canvasDimension.height)
	}
	for (let i = 0; i < minimapHeight; i++) {
		ctx.moveTo(0, i * cellSize)
		ctx.lineTo(canvasDimension.width, i * cellSize)
	}
	ctx.lineWidth = 1
	ctx.strokeStyle = "#0002"
	ctx.stroke()
})

const gameOfLifeAtom = atom((get): GameOfLife | undefined => {
	get(canvasDimensionAtom)
	const canvas = document.querySelector("#game-of-life") as
		| HTMLCanvasElement
		| undefined
	if (!canvas) {
		return
	}
	const gameDimension = get(gameDimensionAtom)
	const gameOfLife = new Cpu(canvas, gameDimension)
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

const playEffect = atomEffect((get, set) => {
	const generationTime = get(generationTimeAtom)
	const gameOfLife = get(gameOfLifeAtom)
	const play = get(playAtom)
	if (!gameOfLife || !play) {
		return
	}
	const playInterval = window.setInterval(() => {
		gameOfLife.step()
		set(drawAtom)
	}, generationTime)
	return () => {
		window.clearInterval(playInterval)
	}
})

const MAX_MINIMAX_SIZE = 300

const minimapEffect = atomEffect((get, set) => {
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

	const minimapWidth = get(minimapWidthAtom)
	const minimapHeigt = get(minimapHeightAtom)
	const minimapPositionFloor = get(minimapPositionFloorAtom)

	ctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height)
	ctx.fillStyle = "#8888"
	ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height)

	ctx.fillStyle = "#F808"
	ctx.fillRect(
		minimapPositionFloor.x * widthRatio,
		minimapPositionFloor.y * heightRatio,
		minimapWidth * widthRatio,
		minimapHeigt * heightRatio,
	)
	set(drawAtom)
})

let isPanning = false
let last: Position | undefined

const onMouseDownAtom = atom(null, (_get, _set, e: React.MouseEvent) => {
	isPanning = true
	last = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
})

const onMouseUpAtom = atom(null, () => {
	isPanning = false
	last = undefined
})

const onMouseMoveAtom = atom(null, (get, set, e: React.MouseEvent) => {
	if (!isPanning || !last) {
		return
	}

	const canvasDimension = get(canvasDimensionAtom)
	const minimapPosition = get(minimapPositionAtom)
	const minimapWidth = get(minimapWidthAtom)
	const minimapHeight = get(minimapHeightAtom)
	const gameDimension = get(gameDimensionAtom)

	const current: Position = {
		x: e.nativeEvent.offsetX,
		y: e.nativeEvent.offsetY,
	}

	const delta: Position = {
		x: current.x - last.x,
		y: current.y - last.y,
	}

	const deltaMinimap: Position = {
		x: delta.x * (minimapWidth / canvasDimension.width),
		y: delta.y * (minimapHeight / canvasDimension.height),
	}

	const newPosition: Position = {
		x: clamp(
			minimapPosition.x - deltaMinimap.x,
			0,
			gameDimension.width - minimapWidth,
		),
		y: clamp(
			minimapPosition.y - deltaMinimap.y,
			0,
			gameDimension.height - minimapHeight,
		),
	}

	set(minimapPositionAtom, newPosition)
	last = structuredClone(current)
})

const ZOOM_SENSITIVITY = 0.0015

const onWheelAtom = atom(null, (get, set, e: React.WheelEvent) => {
	const minimapWidth = get(minimapWidthAtom)
	const minimapHeight = get(minimapHeightAtom)
	const minimapPosition = get(minimapPositionAtom)
	const gameDimension = get(gameDimensionAtom)
	const canvasDimension = get(canvasDimensionAtom)
	const maxMinimapWidth = get(maxMinimapWidthAtom)

	const deltaPx = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
	const minimapFactor = Math.exp(deltaPx * ZOOM_SENSITIVITY)

	const newMinimapWidth = Math.floor(
		clamp(minimapWidth * minimapFactor, 1, maxMinimapWidth),
	)

	if (newMinimapWidth < 10) {
		return
	}

	const newMinimapHeight = Math.floor(
		Math.min(
			Math.floor(
				(newMinimapWidth * canvasDimension.height) / canvasDimension.width,
			),
			gameDimension.height,
		),
	)
	if (newMinimapHeight <= 0) {
		return
	}

	const ratioX = e.nativeEvent.offsetX / canvasDimension.width
	const ratioY = e.nativeEvent.offsetY / canvasDimension.height

	const newPosition: Position = {
		x: clamp(
			minimapPosition.x + ratioX * (minimapWidth - newMinimapWidth),
			0,
			gameDimension.width - newMinimapWidth,
		),

		y: clamp(
			minimapPosition.y + ratioY * (minimapHeight - newMinimapHeight),
			0,
			gameDimension.height - newMinimapHeight,
		),
	}

	set(minimapWidthAtom, newMinimapWidth)
	set(minimapPositionAtom, newPosition)
})

const drawAtom = atom(null, (get) => {
	const gameOfLife = get(gameOfLifeAtom)
	if (!gameOfLife) {
		throw new Error("No game of life")
	}
	const minimapPositionFloor = get(minimapPositionFloorAtom)
	const minimapWidth = get(minimapWidthAtom)
	const minimapHeight = get(minimapHeightAtom)
	gameOfLife.draw(minimapPositionFloor, {
		width: minimapWidth,
		height: minimapHeight,
	})
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
	minimapWidthAtom,
	minimapHeightAtom,
	minimapPositionAtom,
	minimapPositionFloorAtom,
	onWheelAtom,
	drawAtom,
}

export const jotaiStore = createStore()
