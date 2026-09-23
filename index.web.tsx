import ReactDOM from "react-dom/client";
import { App } from "./src/navigation/App";
import "./src/web/webGlobals.css";
import "./src/web/webShell.css";

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
