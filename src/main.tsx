import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { MapEditorProvider } from "./MapEditorProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapEditorProvider>
      <App />
    </MapEditorProvider>
  </StrictMode>,
);
