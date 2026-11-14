import {
	LAYOUT,
	PLOT_WIDTH,
	type Scale,
	valueToY,
} from "@/components/stats/chart"

type YAxisProps = {
	scale: Scale
	formatValue: (value: number) => string
}

export const YAxis = ({ scale, formatValue }: YAxisProps) => {
	return (
		<g>
			{scale.ticks.map((tick) => {
				const y = valueToY(scale, tick)
				return (
					<g key={tick}>
						<line
							x1={LAYOUT.left}
							x2={LAYOUT.left + PLOT_WIDTH}
							y1={y}
							y2={y}
							className="stroke-border"
							strokeDasharray="4 4"
						/>
						<text
							x={LAYOUT.left - 8}
							y={y}
							textAnchor="end"
							dominantBaseline="middle"
							className="fill-muted-foreground text-[10px]"
						>
							{formatValue(tick)}
						</text>
					</g>
				)
			})}
		</g>
	)
}
