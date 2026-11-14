import { BarChart } from "@/components/stats/bar-chart"
import {
	type ChartSeries,
	createLogScale,
	formatSpeedup,
} from "@/components/stats/chart"
import { ChartCard } from "@/components/stats/chart-card"
import type { CpuGpuMeasure } from "@/lib/benchmark-data"

const series: ChartSeries[] = [
	{ key: "speedup", label: "Speedup", className: "fill-emerald-500" },
]

type SpeedupChartProps = {
	measures: CpuGpuMeasure[]
}

export const SpeedupChart = ({ measures }: SpeedupChartProps) => {
	const data = measures.map((measure) => ({
		label: `${measure.size}²`,
		values: { speedup: measure.cpu / measure.gpu },
	}))
	const speedups = data.map((datum) => datum.values.speedup)
	const scale = createLogScale(
		speedups.reduce((a, b) => Math.min(a, b)),
		speedups.reduce((a, b) => Math.max(a, b)),
	)
	return (
		<ChartCard
			title="GPU speedup"
			description="CPU duration / GPU duration (log scale)"
		>
			<BarChart
				title="GPU speedup"
				data={data}
				series={series}
				scale={scale}
				formatValue={formatSpeedup}
			/>
		</ChartCard>
	)
}
