import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { BookOpenText, Dices, Pause, Play, Redo, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { atoms } from "@/lib/jotai"

export const Buttons = () => {
	const gameOfLife = useAtomValue(atoms.gameOfLifeAtom)
	const getRandomGrid = useSetAtom(atoms.getRandomGridAtom)
	const [play, setPlay] = useAtom(atoms.playAtom)
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
					gameOfLife?.step()
				}}
			>
				<Redo />
			</Button>
			<Button size="icon">
				<RotateCcw />
			</Button>
			<Button
				size="icon"
				onClick={() => {
					const grid = getRandomGrid(0.1)
					gameOfLife?.setGame(grid)
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
