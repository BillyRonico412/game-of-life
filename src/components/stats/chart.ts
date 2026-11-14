export type ChartSeries = { key: string; label: string; className: string }
export type ChartDatum = { label: string; values: Record<string, number> }

/** Maps a value to a ratio in [0, 1] of the plot height. */
export type Scale = { ticks: number[]; ratio: (value: number) => number }

export const LAYOUT = {
	width: 600,
	height: 260,
	top: 20,
	right: 8,
	bottom: 28,
	left: 64,
}
export const PLOT_WIDTH = LAYOUT.width - LAYOUT.left - LAYOUT.right
export const PLOT_HEIGHT = LAYOUT.height - LAYOUT.top - LAYOUT.bottom

export const valueToY = (scale: Scale, value: number) => {
	return LAYOUT.top + PLOT_HEIGHT * (1 - scale.ratio(value))
}

export const createLogScale = (min: number, max: number): Scale => {
	const minExponent = Math.floor(Math.log10(min))
	const maxExponent = Math.max(Math.ceil(Math.log10(max)), minExponent + 1)
	const range = maxExponent - minExponent
	const ticks = Array.from(
		{ length: range + 1 },
		(_, i) => 10 ** (minExponent + i),
	)
	return {
		ticks,
		ratio: (value) => {
			const ratio = (Math.log10(value) - minExponent) / range
			return Math.min(Math.max(ratio, 0), 1)
		},
	}
}

const niceStep = (rough: number) => {
	const magnitude = 10 ** Math.floor(Math.log10(rough))
	const residual = rough / magnitude
	if (residual > 5) {
		return 10 * magnitude
	}
	if (residual > 2) {
		return 5 * magnitude
	}
	if (residual > 1) {
		return 2 * magnitude
	}
	return magnitude
}

export const createLinearScale = (max: number, nbTicks = 5): Scale => {
	const step = niceStep(max / nbTicks)
	const top = Math.ceil(max / step) * step
	const ticks = Array.from(
		{ length: Math.round(top / step) + 1 },
		(_, i) => i * step,
	)
	return { ticks, ratio: (value) => value / top }
}

export const formatDuration = (ms: number) => {
	if (ms >= 1000) {
		return `${Number((ms / 1000).toFixed(1)).toLocaleString("en-US")} s`
	}
	return `${Math.round(ms)} ms`
}

export const formatSpeedup = (ratio: number) => {
	return `x${Number(ratio.toFixed(1)).toLocaleString("en-US")}`
}
