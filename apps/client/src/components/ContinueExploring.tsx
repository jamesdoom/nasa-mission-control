import { useId } from "react";
import { explorationLink } from "../utils/explorationContext";
import { Link, useLocation } from "react-router-dom";
import type { ExplorationLink } from "../data/contextualLinks";

export function ContinueExploring({ links }: { links: ExplorationLink[] }) {
  const headingId = useId();
  const location = useLocation();
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
            to={explorationLink(
              link.to,
              location.pathname + location.search + location.hash,
            )}
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
