import { Bar } from "@/components/stats/bar"
import {
	type ChartDatum,
	type ChartSeries,
	LAYOUT,
	PLOT_HEIGHT,
	type Scale,
	valueToY,
} from "@/components/stats/chart"

type BarGroupProps = {
	datum: ChartDatum
	series: ChartSeries[]
	x: number
	width: number
	scale: Scale
	formatValue: (value: number) => string
}

const GROUP_PADDING = 0.2

export const BarGroup = ({
	datum,
	series,
	x,
	width,
	scale,
	formatValue,
}: BarGroupProps) => {
	const innerWidth = width * (1 - GROUP_PADDING)
	const barWidth = innerWidth / series.length
	const start = x + (width - innerWidth) / 2
	const bottom = LAYOUT.top + PLOT_HEIGHT
	return (
		<g>
			{series.map((serie, index) => {
				const value = datum.values[serie.key]
				const y = valueToY(scale, value)
				return (
					<Bar
						key={serie.key}
						x={start + index * barWidth}
						y={y}
						width={barWidth - 2}
						height={bottom - y}
						className={serie.className}
						label={formatValue(value)}
					/>
				)
			})}
			<text
				x={x + width / 2}
				y={bottom + 16}
				textAnchor="middle"
				className="fill-muted-foreground text-[10px]"
			>
				{datum.label}
			</text>
		</g>
	)
}
