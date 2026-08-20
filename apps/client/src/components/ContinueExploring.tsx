import { useId } from "react";
import { Link } from "react-router-dom";
import type { ExplorationLink } from "../data/contextualLinks";

export function ContinueExploring({ links }: { links: ExplorationLink[] }) {
  const headingId = useId();
  return (
    <aside className="continue-exploring" aria-labelledby={headingId}>
      <div className="section-heading">
        <div>
          <p className="kicker">
            <span />
            Connected evidence
          </p>
          <h2 id={headingId}>Continue exploring</h2>
        </div>
        <p>Follow this observation into another mission instrument.</p>
      </div>
      <div className="module-grid">
        {links.map((link, index) => (
          <Link
            className="module-card module-card--active"
            to={link.to}
            key={link.to}
          >
            <span>0{index + 1}</span>
            <small>{link.code}</small>
            <h3>{link.title}</h3>
            <p>{link.description}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
