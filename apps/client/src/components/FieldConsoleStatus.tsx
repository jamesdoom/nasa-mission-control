import { useServiceWorker } from "../hooks/useServiceWorker";

export function FieldConsoleStatus() {
  const fieldConsole = useServiceWorker();
  if (!fieldConsole.ready) return null;

  return (
    <div
      className={
        fieldConsole.updateAvailable
          ? "field-console field-console--update"
          : "field-console"
      }
      role="status"
    >
      <span aria-hidden="true" />
      <div>
        <strong>
          {fieldConsole.updateAvailable
            ? "Console update ready"
            : "Offline field console ready"}
        </strong>
        <small>
          {fieldConsole.updateAvailable
            ? "Apply the new version when you are ready."
            : `Curated instruments cached${fieldConsole.version ? ` // ${fieldConsole.version}` : ""}`}
        </small>
      </div>
      {fieldConsole.updateAvailable ? (
        <button type="button" onClick={fieldConsole.applyUpdate}>
          Update and reload
        </button>
      ) : null}
    </div>
  );
}
