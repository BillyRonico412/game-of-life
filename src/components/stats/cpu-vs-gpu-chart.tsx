import { BarChart } from "@/components/stats/bar-chart"
import {
	type ChartSeries,
	createLogScale,
	formatDuration,
} from "@/components/stats/chart"
import { ChartCard } from "@/components/stats/chart-card"
import { ChartLegend } from "@/components/stats/chart-legend"
import type { CpuGpuMeasure } from "@/lib/benchmark-data"

const series: ChartSeries[] = [
	{ key: "cpu", label: "CPU", className: "fill-orange-500" },
	{ key: "gpu", label: "GPU", className: "fill-sky-500" },
]

type CpuVsGpuChartProps = {
	measures: CpuGpuMeasure[]
	nbGenerations: number
}

export const CpuVsGpuChart = ({
	measures,
	nbGenerations,
}: CpuVsGpuChartProps) => {
	const data = measures.map((measure) => ({
		label: `${measure.size}²`,
		values: { cpu: measure.cpu, gpu: measure.gpu },
	}))
	const values = measures.flatMap((measure) => [measure.cpu, measure.gpu])
	const scale = createLogScale(
		values.reduce((a, b) => Math.min(a, b)),
		values.reduce((a, b) => Math.max(a, b)),
	)
	return (
		<ChartCard
			title="CPU vs GPU"
			description={`Duration of ${nbGenerations} generations (log scale, average of runs)`}
		>
			<ChartLegend series={series} />
			<BarChart
				title="CPU vs GPU"
				data={data}
				series={series}
				scale={scale}
				formatValue={formatDuration}
			/>
		</ChartCard>
	)
}
