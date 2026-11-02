import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { Provider } from "jotai"
import { jotaiStore } from "@/lib/jotai.ts"
import { App } from "./App.tsx"

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<Provider store={jotaiStore}>
			<App />
		</Provider>
	</StrictMode>,
)
