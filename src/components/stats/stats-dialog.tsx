import { ChartColumn } from "lucide-react"
import { CpuVsGpuChart } from "@/components/stats/cpu-vs-gpu-chart"
import { GpuScalingChart } from "@/components/stats/gpu-scaling-chart"
import { SpeedupChart } from "@/components/stats/speedup-chart"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	averageRuns,
	cpuVsGpuRuns,
	gpuLargeSizes,
	NB_GENERATIONS,
} from "@/lib/benchmark-data"

const averagedMeasures = averageRuns(cpuVsGpuRuns)

export const StatsDialog = () => {
	return (
		<Dialog>
			<DialogTrigger render={<Button size="icon" />}>
				<ChartColumn />
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Benchmark</DialogTitle>
					<DialogDescription>
						Game of Life performance, CPU vs GPU (WebGPU compute shader).
					</DialogDescription>
				</DialogHeader>
				<CpuVsGpuChart
					measures={averagedMeasures}
					nbGenerations={NB_GENERATIONS}
				/>
				<SpeedupChart measures={averagedMeasures} />
				<GpuScalingChart
					measures={gpuLargeSizes}
					nbGenerations={NB_GENERATIONS}
				/>
			</DialogContent>
		</Dialog>
	)
}
