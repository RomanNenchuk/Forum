import { createRoot } from "react-dom/client";
import "./config/firebase-config.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./i18n.js";
import "./main.css";
import App from "./components/App.jsx";

createRoot(document.getElementById("root")).render(<App />);
