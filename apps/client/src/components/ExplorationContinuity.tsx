import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSavedExplorations } from "../hooks/useSavedExplorations";
import {
  safeExplorationPath,
  withoutReturn,
} from "../utils/explorationContext";

export function ExplorationContinuity() {
  const location = useLocation();
  const path = location.pathname + location.search + location.hash;
  const from = new URLSearchParams(location.search).get("returnTo");
  const saved = useSavedExplorations();
  const [notice, setNotice] = useState({ path: "", text: "" });
  if (!safeExplorationPath(path)) return null;
  const isSaved = saved.items.some((item) => item.path === path);
  return (
    <aside
      className="section exploration-continuity"
      aria-label="Exploration continuity"
    >
      {safeExplorationPath(from) &&
      withoutReturn(from) !== withoutReturn(path) ? (
        <Link to={from}>Return to previous exploration →</Link>
      ) : null}
      <div>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            const title =
              document.querySelector("main h1")?.textContent ??
              "Saved exploration";
            const persisted = saved.save(path, title);
            setNotice({
              path,
              text: persisted
                ? "Exploration saved with its filters and return link in this browser."
                : "Browser storage is unavailable. This exploration is saved for this session only.",
            });
          }}
        >
          {isSaved
            ? "Update saved exploration"
            : "Save exploration to Flight Log"}
        </button>
        <Link to="/favorites#resume">Resume from Flight Log →</Link>
      </div>
      <p role="status">
        {notice.path === path
          ? notice.text
          : "Save this view to return to its filters and starting context. Live records may change."}
      </p>
    </aside>
  );
}
