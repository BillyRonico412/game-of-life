import type { ChartSeries } from "@/components/stats/chart"

type ChartLegendProps = {
	series: ChartSeries[]
}

export const ChartLegend = ({ series }: ChartLegendProps) => {
	return (
		<div className="flex items-center gap-4 text-xs">
			{series.map((serie) => (
				<div key={serie.key} className="flex items-center gap-1.5">
					<svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
						<rect width={10} height={10} rx={2} className={serie.className} />
					</svg>
					<span>{serie.label}</span>
				</div>
			))}
		</div>
	)
}
