import { useEffect, useState } from "react";

type FieldConsoleState = {
  ready: boolean;
  updateAvailable: boolean;
  version: string | null;
  applyUpdate: () => void;
};

type FieldConsoleLifecycle = Omit<FieldConsoleState, "applyUpdate">;

const initialState = {
  ready: false,
  updateAvailable: false,
  version: null,
};

function isVersionMessage(
  value: unknown,
): value is { type: "FIELD_CONSOLE_VERSION"; version: string } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.type === "FIELD_CONSOLE_VERSION" &&
    typeof record.version === "string"
  );
}

export function useServiceWorker(): FieldConsoleState {
  const [state, setState] = useState<FieldConsoleLifecycle>(initialState);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let reloading = false;

    const handleMessage = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (isVersionMessage(message)) {
        setState((current) => ({ ...current, version: message.version }));
      }
    };
    const handleControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    void navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.waiting) {
          setWaiting(registration.waiting);
          setState((current) => ({ ...current, updateAvailable: true }));
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          installing?.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaiting(installing);
              setState((current) => ({ ...current, updateAvailable: true }));
            }
          });
        });
        return navigator.serviceWorker.ready;
      })
      .then((registration) => {
        setState((current) => ({ ...current, ready: true }));
        registration.active?.postMessage({ type: "GET_VERSION" });
      })
      .catch(() => undefined);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  return {
    ...state,
    applyUpdate: () => waiting?.postMessage({ type: "SKIP_WAITING" }),
  };
}
