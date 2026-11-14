type BarProps = {
	x: number
	y: number
	width: number
	height: number
	className: string
	label: string
}

export const Bar = ({ x, y, width, height, className, label }: BarProps) => {
	return (
		<g>
			<rect
				x={x}
				y={y}
				width={width}
				height={height}
				rx={2}
				className={className}
			>
				<title>{label}</title>
			</rect>
			<text
				x={x + width / 2}
				y={y - 4}
				textAnchor="middle"
				className="fill-foreground text-[9px]"
			>
				{label}
			</text>
		</g>
	)
}
