// import { Cpu } from "@/lib/cpu"
import { Gpu } from "@/lib/gpu"

export type StatItem = Record<"cpu" | "gpu", number>
export type Stats = Record<number, StatItem>

const NB_GENERATIONS = 1000
// const sizes = [50, 100, 250, 500, 1000]
const sizes = [5000, 10_000]

const createCanvas = () => {
	const canvas = document.createElement("canvas")
	canvas.width = 300
	canvas.height = 300
	document.body.appendChild(canvas)
	return canvas
}

const createRandomGrid = (size: number, aliveRatio = 0.5) => {
	const grid = new Uint32Array(size * size)
	for (let i = 0; i < grid.length; i++) {
		grid[i] = Number(Math.random() < aliveRatio)
	}
	return grid
}

export const logStats = async (device: GPUDevice) => {
	const gpuCanvas = createCanvas()
	// const cpuCanvas = createCanvas()

	let time: number

	// Warm up the GPU with a small step before measuring performance
	const gpu = new Gpu(gpuCanvas, { width: 10, height: 10 }, device)
	gpu.step()
	await gpu.device.queue.onSubmittedWorkDone()
	gpu.clear()

	for (const size of sizes) {
		const grid = createRandomGrid(size)
		const gpu = new Gpu(gpuCanvas, { width: size, height: size }, device)
		gpu.setGame(grid)
		await gpu.device.queue.onSubmittedWorkDone()

		time = performance.now()
		for (let i = 0; i < NB_GENERATIONS; i++) {
			gpu.step()
		}
		await gpu.device.queue.onSubmittedWorkDone()
		const gpuTime = performance.now() - time
		gpu.clear()

		// const cpu = new Cpu(cpuCanvas, { width: size, height: size })
		// cpu.setGame(grid)
		// time = performance.now()
		// for (let i = 0; i < NB_GENERATIONS; i++) {
		// 	cpu.step()
		// }
		// const cpuTime = performance.now() - time
		// cpu.clear()

		console.log({ size, gpu: gpuTime })
	}
}
