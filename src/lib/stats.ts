import { Gpu } from "@/lib/gpu"

export type StatItem = Record<"cpu" | "gpu", number>
export type Stats = Record<number, StatItem>

const NB_GENERATIONS = 1000
const sizes = [1000, 5000, 10000]

const createCanvas = () => {
	const canvas = document.createElement("canvas")
	canvas.width = 300
	canvas.height = 300
	document.body.appendChild(canvas)
	return canvas
}

export const logStats = async (device: GPUDevice) => {
	const gpuCanvas = createCanvas()

	let time: number

	// Warm up the GPU with a small step before measuring performance
	const gpu = new Gpu(gpuCanvas, { width: 10, height: 10 }, device)
	gpu.step()
	await gpu.device.queue.onSubmittedWorkDone()
	gpu.clear()

	for (const size of sizes) {
		time = performance.now()
		const gpu = new Gpu(gpuCanvas, { width: size, height: size }, device)
		for (let i = 0; i < NB_GENERATIONS; i++) {
			gpu.step()
		}
		await gpu.device.queue.onSubmittedWorkDone()
		const gpuTime = performance.now() - time
		gpu.clear()
		console.log({ size, gpu: gpuTime })
	}
}
