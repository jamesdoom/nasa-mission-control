import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { App } from "./App";
import "./styles/global.css";
import { registerClientTelemetry } from "./utils/clientTelemetry";
const root = document.getElementById("root");
if (!root) throw new Error("Application root was not found.");
const speedInsightsEnabled =
  import.meta.env.PROD &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";
registerClientTelemetry();
createRoot(root).render(
  <StrictMode>
    <App />
    {speedInsightsEnabled ? <SpeedInsights /> : null}
  </StrictMode>,
);
