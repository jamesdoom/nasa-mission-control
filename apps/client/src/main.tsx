import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import "./styles/global.css";
import { registerClientTelemetry } from "./utils/clientTelemetry";
import { ApiError } from "./api/apod";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        failureCount < 1 && (!(error instanceof ApiError) || error.retryable),
    },
  },
});
const root = document.getElementById("root");
if (!root) throw new Error("Application root was not found.");
registerClientTelemetry();
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
