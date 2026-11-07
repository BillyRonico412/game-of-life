import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { BookOpenText, Dices, Pause, Play, Redo, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { atoms } from "@/lib/jotai"

export const Buttons = () => {
	const gameOfLife = useAtomValue(atoms.gameOfLifeAtom)
	const getRandomGrid = useSetAtom(atoms.getRandomGridAtom)
	const getClearGrid = useSetAtom(atoms.getClearGridAtom)
	const draw = useSetAtom(atoms.drawAtom)
	const [play, setPlay] = useAtom(atoms.playAtom)
	if (!gameOfLife) {
		return null
	}
	return (
		<div className="flex items-center gap-1">
			<Button
				size="icon"
				onClick={() => {
					setPlay(true)
				}}
				disabled={play}
			>
				<Play />
			</Button>
			<Button
				size="icon"
				disabled={!play}
				onClick={() => {
					setPlay(false)
				}}
			>
				<Pause />
			</Button>
			<Button
				size="icon"
				onClick={() => {
					gameOfLife.step()
					draw()
				}}
			>
				<Redo />
			</Button>
			<Button
				size="icon"
				onClick={() => {
					const grid = getClearGrid()
					gameOfLife.setGame(grid)
					draw()
				}}
			>
				<RotateCcw />
			</Button>
			<Button
				size="icon"
				onClick={() => {
					const grid = getRandomGrid(0.1)
					gameOfLife.setGame(grid)
					draw()
				}}
			>
				<Dices />
			</Button>
			<Button size="icon">
				<BookOpenText />
			</Button>
		</div>
	)
}
