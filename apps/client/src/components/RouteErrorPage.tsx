import { Link, useRouteError } from "react-router-dom";

export function RouteErrorPage() {
  const error = useRouteError();
  const staleModule =
    error instanceof Error &&
    error.message.includes("Failed to fetch dynamically imported module");

  return (
    <main className="route-error" id="main-content">
      <p className="kicker">Transmission interrupted</p>
      <h1>{staleModule ? "Mission update available" : "Navigation failure"}</h1>
      <p>
        {staleModule
          ? "Mission Control was updated while this page was open. Reload to connect to the latest version."
          : "This module could not be displayed. Reload the page or return to Mission Control."}
      </p>
      <div className="route-error__actions">
        <button
          className="button button--primary"
          type="button"
          onClick={() => window.location.reload()}
        >
          Reload Mission Control
        </button>
        <Link className="button button--secondary" to="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
