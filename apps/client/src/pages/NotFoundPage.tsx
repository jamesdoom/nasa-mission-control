import { Link } from "react-router-dom";
export function NotFoundPage() {
  return (
    <section className="section empty-state">
      <span aria-hidden="true">404</span>
      <h1>Trajectory not found</h1>
      <p>
        The requested coordinate does not match an active Mission Control route.
      </p>
      <Link className="button" to="/">
        Return to dashboard
      </Link>
    </section>
  );
}
