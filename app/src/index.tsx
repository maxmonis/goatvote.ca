import {createRoot} from "react-dom/client"

import App from "./App"

import "./localization/i18n"

createRoot(document.getElementById("root") as HTMLElement).render(<App />)
