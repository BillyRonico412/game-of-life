export type CpuGpuMeasure = { size: number; cpu: number; gpu: number }
export type GpuMeasure = { size: number; gpu: number }

export const NB_GENERATIONS = 1000

/** Durations (ms) for NB_GENERATIONS generations on a size x size grid, one array per run. */
export const cpuVsGpuRuns: CpuGpuMeasure[][] = [
	[
		{ size: 50, cpu: 556.2, gpu: 232 },
		{ size: 100, cpu: 2065.3, gpu: 154.1 },
		{ size: 250, cpu: 12642.9, gpu: 183.4 },
		{ size: 500, cpu: 50052.1, gpu: 351.5 },
		{ size: 1000, cpu: 236721, gpu: 411.2 },
	],
	[
		{ size: 50, cpu: 737.7, gpu: 172.1 },
		{ size: 100, cpu: 2556.6, gpu: 246.5 },
		{ size: 250, cpu: 19347.6, gpu: 131.2 },
		{ size: 500, cpu: 75663.2, gpu: 368.8 },
		{ size: 1000, cpu: 255948.1, gpu: 531.2 },
	],
]

export const gpuLargeSizes: GpuMeasure[] = [
	{ size: 1000, gpu: 437.8 },
	{ size: 5000, gpu: 4184.7 },
	{ size: 10000, gpu: 16909.6 },
]

export const averageRuns = (runs: CpuGpuMeasure[][]): CpuGpuMeasure[] => {
	return runs[0].map((measure, index) => {
		let cpu = 0
		let gpu = 0
		for (const run of runs) {
			cpu += run[index].cpu
			gpu += run[index].gpu
		}
		return {
			size: measure.size,
			cpu: cpu / runs.length,
			gpu: gpu / runs.length,
		}
	})
}
