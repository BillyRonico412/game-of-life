import { useAtom, useSetAtom } from "jotai"
import { Controllers } from "@/components/controllers"
import { GridInfo } from "@/components/grid-info"
import { Minimap } from "@/components/minimap"
import { Sliders } from "@/components/sliders"
import { atoms } from "@/lib/jotai"

export const App = () => {
	useAtom(atoms.drawGridEffect)
	useAtom(atoms.playEffect)
	useAtom(atoms.minimapEffect)

	const onMouseUp = useSetAtom(atoms.onMouseUpAtom)
	const onMouseDown = useSetAtom(atoms.onMouseDownAtom)
	const onMouseMove = useSetAtom(atoms.onMouseMoveAtom)
	const onWheel = useSetAtom(atoms.onWheelAtom)

	return (
		<div className="w-screen h-screen overflow-hidden relative">
			<canvas
				id="game-of-life"
				className="w-full h-full"
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				onMouseMove={onMouseMove}
				onWheel={onWheel}
			></canvas>
			<canvas
				id="grid"
				className="w-dvw h-dvh fixed inset-0 top-0 left-0 pointer-events-none"
			></canvas>
			<div className="absolute left-1/2 bottom-4 -translate-x-1/2">
				<Controllers />
			</div>
			<div className="absolute left-4 bottom-4">
				<GridInfo />
			</div>
			<div className="absolute right-4 bottom-4">
				<Sliders />
			</div>
			<div className="absolute top-4 right-4">
				<Minimap />
			</div>
		</div>
	)
}
