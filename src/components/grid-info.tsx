import { useAtomValue } from "jotai"
import { Card, CardContent } from "@/components/ui/card"
import { atoms } from "@/lib/jotai"

export const GridInfo = () => {
	const canvasDimension = useAtomValue(atoms.canvasDimensionAtom)
	const gameDimension = useAtomValue(atoms.gameDimensionAtom)
	const zoomWidth = useAtomValue(atoms.zoomWidthAtom)
	const zoomHeight = useAtomValue(atoms.zoomHeightAtom)
	const nbCells = useAtomValue(atoms.nbCellsAtom)
	return (
		<Card>
			<CardContent>
				<div>
					<div className="text-sm">
						<div className="flex items-center gap-2">
							<span>Game dimension: </span>
							<span>
								{gameDimension.width} x {gameDimension.height}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span>Canvas dimension: </span>
							<span>
								{canvasDimension.width} x {canvasDimension.height}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span>Zoom Dimension: </span>
							<span>
								{zoomWidth} x {zoomHeight}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span>Nb Cells: </span>
							<span>{nbCells.toLocaleString("en-US")}</span>
						</div>
						<div className="flex items-center gap-2">
							<span>Generation:</span>
							<span>1</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
