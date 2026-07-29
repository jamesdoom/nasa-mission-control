export function LoadingState() {
  return (
    <div className="state-panel" role="status">
      <span className="loader" />
      <div>
        <strong>Acquiring deep-space signal</strong>
        <p>Contacting the NASA data network…</p>
      </div>
    </div>
  );
}
export function ErrorState({
  message,
  requestId,
  retry,
}: {
  message: string;
  requestId?: string | undefined;
  retry: () => void;
}) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <div>
        <strong>Telemetry interrupted</strong>
        <p>{message}</p>
        {requestId && <small>Reference: {requestId}</small>}
      </div>
      <button
        className="button button--secondary"
        type="button"
        onClick={retry}
      >
        Retry transmission
      </button>
    </div>
  );
}
