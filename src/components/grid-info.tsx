import { useAtomValue } from "jotai"
import { Card, CardContent } from "@/components/ui/card"
import { atoms } from "@/lib/jotai"

export const GridInfo = () => {
	const canvasDimension = useAtomValue(atoms.canvasDimensionAtom)
	const gameDimension = useAtomValue(atoms.gameDimensionAtom)
	const minimapWidth = useAtomValue(atoms.minimapWidthAtom)
	const minimapHeight = useAtomValue(atoms.minimapHeightAtom)
	const minimapPositionFloor = useAtomValue(atoms.minimapPositionFloorAtom)
	const generationDuration = useAtomValue(atoms.generationDurationAtom)
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
							<span>Minimap Dimension: </span>
							<span>
								{minimapWidth} x {minimapHeight}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span>Minimap Position: </span>
							<span>
								{minimapPositionFloor.x} x {minimapPositionFloor.y}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span>Nb Cells: </span>
							<span>{nbCells.toLocaleString("en-US")}</span>
						</div>
						<div>
							<span>Generation Duration: {generationDuration} ms</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
