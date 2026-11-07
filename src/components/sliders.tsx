import { useAtom, useSetAtom } from "jotai"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { atoms } from "@/lib/jotai"

export const Sliders = () => {
	const [generationTime, setGenerationTime] = useAtom(atoms.generationTimeAtom)
	const [gameDimension, setGameDimension] = useAtom(atoms.gameDimensionAtom)
	const setPlay = useSetAtom(atoms.playAtom)
	const [gameOfLifeType, setGameOfLifeType] = useAtom(atoms.gameOfLifeTypeAtom)
	return (
		<Card>
			<CardContent className="min-w-[180px] flex flex-col gap-2">
				<div className="flex gap-2">
					<Button
						className="flex-1"
						variant={gameOfLifeType === "cpu" ? "default" : "outline"}
						onClick={() => setGameOfLifeType("cpu")}
					>
						CPU
					</Button>
					<Button
						className="flex-1"
						variant={gameOfLifeType === "gpu" ? "default" : "outline"}
						onClick={() => setGameOfLifeType("gpu")}
					>
						GPU
					</Button>
				</div>
				<div className="flex flex-col gap-2">
					<div>
						<span>Generation time: </span>
						<span>{generationTime} ms</span>
					</div>
					<Slider
						min={20}
						max={200}
						step={10}
						value={generationTime}
						onValueChange={(v) => {
							const value = typeof v === "number" ? v : v[0]
							setGenerationTime(value)
						}}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<div>
						<span>Game Width: </span>
						<span>{gameDimension.width}</span>
					</div>
					<Slider
						min={100}
						max={15_000}
						step={100}
						value={gameDimension.width}
						onValueChange={(v) => {
							const value = typeof v === "number" ? v : v[0]
							setGameDimension({ ...gameDimension, width: value })
							setPlay(false)
						}}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<div>
						<span>Game Height: </span>
						<span>{gameDimension.height}</span>
					</div>
					<Slider
						min={100}
						max={15_000}
						step={100}
						value={gameDimension.height}
						onValueChange={(v) => {
							const value = typeof v === "number" ? v : v[0]
							setGameDimension({ ...gameDimension, height: value })
							setPlay(false)
						}}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
