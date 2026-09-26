import ReactDOM from "react-dom/client";
import { App } from "./src/navigation/App";
import { watchForWebUpdates } from "./src/web/checkForUpdate";
import "./src/web/webGlobals.css";

watchForWebUpdates();
const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
