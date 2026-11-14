import { BarChart } from "@/components/stats/bar-chart"
import {
	type ChartSeries,
	createLinearScale,
	formatDuration,
} from "@/components/stats/chart"
import { ChartCard } from "@/components/stats/chart-card"
import type { GpuMeasure } from "@/lib/benchmark-data"

const series: ChartSeries[] = [
	{ key: "gpu", label: "GPU", className: "fill-sky-500" },
]

type GpuScalingChartProps = {
	measures: GpuMeasure[]
	nbGenerations: number
}

export const GpuScalingChart = ({
	measures,
	nbGenerations,
}: GpuScalingChartProps) => {
	const data = measures.map((measure) => ({
		label: `${measure.size.toLocaleString("en-US")}²`,
		values: { gpu: measure.gpu },
	}))
	const max = measures.reduce((acc, measure) => Math.max(acc, measure.gpu), 0)
	const scale = createLinearScale(max)
	return (
		<ChartCard
			title="GPU on large grids"
			description={`Duration of ${nbGenerations} generations (linear scale)`}
		>
			<BarChart
				title="GPU on large grids"
				data={data}
				series={series}
				scale={scale}
				formatValue={formatDuration}
			/>
		</ChartCard>
	)
}
