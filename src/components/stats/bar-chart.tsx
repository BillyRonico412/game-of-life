import { BarGroup } from "@/components/stats/bar-group"
import {
	type ChartDatum,
	type ChartSeries,
	LAYOUT,
	PLOT_HEIGHT,
	PLOT_WIDTH,
	type Scale,
} from "@/components/stats/chart"
import { YAxis } from "@/components/stats/y-axis"

type BarChartProps = {
	title: string
	data: ChartDatum[]
	series: ChartSeries[]
	scale: Scale
	formatValue: (value: number) => string
}

export const BarChart = ({
	title,
	data,
	series,
	scale,
	formatValue,
}: BarChartProps) => {
	const groupWidth = PLOT_WIDTH / data.length
	const bottom = LAYOUT.top + PLOT_HEIGHT
	return (
		<svg
			viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
			className="h-auto w-full"
			role="img"
			aria-label={title}
		>
			<YAxis scale={scale} formatValue={formatValue} />
			<line
				x1={LAYOUT.left}
				x2={LAYOUT.left + PLOT_WIDTH}
				y1={bottom}
				y2={bottom}
				className="stroke-muted-foreground"
			/>
			{data.map((datum, index) => (
				<BarGroup
					key={datum.label}
					datum={datum}
					series={series}
					x={LAYOUT.left + index * groupWidth}
					width={groupWidth}
					scale={scale}
					formatValue={formatValue}
				/>
			))}
		</svg>
	)
}
