export function LoadingState({
  title = "Loading NASA data",
  detail = "Requesting and validating the selected records…",
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="state-panel state-panel--loading" role="status">
      <span className="loader" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
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
        <strong>NASA data unavailable</strong>
        <p>{message}</p>
        {requestId && <small>Reference: {requestId}</small>}
      </div>
      <button
        className="button button--secondary"
        type="button"
        onClick={retry}
      >
        Try again
      </button>
    </div>
  );
}
