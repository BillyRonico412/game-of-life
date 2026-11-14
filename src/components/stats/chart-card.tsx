import type { ReactNode } from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

type ChartCardProps = {
	title: string
	description: string
	children: ReactNode
}

export const ChartCard = ({ title, description, children }: ChartCardProps) => {
	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">{children}</CardContent>
		</Card>
	)
}
