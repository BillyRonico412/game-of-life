import { useAtom } from "jotai"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { atoms } from "@/lib/jotai"

export const Sliders = () => {
	const [generationTime, setGenerationTime] = useAtom(atoms.generationTimeAtom)
	return (
		<Card>
			<CardContent className="min-w-[180px] flex flex-col gap-4">
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
			</CardContent>
		</Card>
	)
}
