import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { discoveryJourneys } from "../data/journeys";
import { missions } from "../data/missions";
import { SearchIcon } from "./Icons";

type Command = {
  id: string;
  label: string;
  description: string;
  category: "Instrument" | "Mission" | "Discovery" | "Utility";
  to: string;
  keywords: string;
};

const instrumentSeeds = [
  [
    "dashboard",
    "Mission Control Dashboard",
    "Daily briefing and telemetry",
    "/",
  ],
  [
    "apod",
    "Astronomy Picture of the Day",
    "Browse NASA’s daily image or video",
    "/apod",
  ],
  [
    "asteroids",
    "Asteroid Watch",
    "Inspect near-Earth object approaches",
    "/asteroids",
  ],
  [
    "media",
    "NASA Media Library",
    "Search NASA images, video, and audio",
    "/media",
  ],
  [
    "space-weather",
    "Space Weather Center",
    "Review DONKI observations",
    "/space-weather",
  ],
  ["earth", "Earth Observatory", "Explore EPIC and GIBS imagery", "/earth"],
  [
    "missions",
    "Mission Archive",
    "Browse source-checked mission history",
    "/missions",
  ],
  ["trivia", "Space Trivia", "Test source-checked space knowledge", "/trivia"],
] as const;

const instrumentCommands: Command[] = instrumentSeeds.map(
  ([id, label, description, to]) => ({
    id,
    label,
    description,
    to,
    category: "Instrument",
    keywords: `${label} ${description}`.toLowerCase(),
  }),
);

const utilityCommands: Command[] = [
  {
    id: "flight-log",
    label: "Personal Flight Log",
    description: "Open saved discoveries and recent history",
    category: "Utility",
    to: "/favorites",
    keywords: "favorites saved collection recent history flight log",
  },
  {
    id: "about",
    label: "About this project",
    description: "Review architecture, evidence, and attribution",
    category: "Utility",
    to: "/about",
    keywords: "about architecture portfolio evidence attribution",
  },
];

const commands: Command[] = [
  ...instrumentCommands,
  ...missions.map((mission) => ({
    id: `mission-${mission.slug}`,
    label: mission.name,
    description: `${mission.destination} · ${mission.statusLabel}`,
    category: "Mission" as const,
    to: `/missions/${mission.slug}`,
    keywords:
      `${mission.name} ${mission.program} ${mission.destination} ${mission.vehicle}`.toLowerCase(),
  })),
  ...discoveryJourneys.map((journey) => ({
    id: `journey-${journey.id}`,
    label: journey.title,
    description: journey.summary,
    category: "Discovery" as const,
    to: "/discover",
    keywords:
      `${journey.title} ${journey.summary} ${journey.outcome}`.toLowerCase(),
  })),
  ...utilityCommands,
];

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return terms.length === 0
      ? commands
      : commands.filter((command) =>
          terms.every(
            (term) =>
              command.keywords.includes(term) ||
              command.category.toLowerCase().includes(term),
          ),
        );
  }, [query]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  function select(command: Command | undefined) {
    if (!command) return;
    void navigate(command.to);
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) =>
        results.length === 0
          ? 0
          : (index + direction + results.length) % results.length,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      select(results[activeIndex]);
      return;
    }
    if (event.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "input, button:not([disabled])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div
      className="command-palette-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette__header">
          <SearchIcon size={20} />
          <div>
            <span className="telemetry">Global navigation</span>
            <h2 id="command-palette-title">Command search</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command search"
          >
            ESC
          </button>
        </div>
        <label className="sr-only" htmlFor="command-search-input">
          Search instruments, missions, and discovery paths
        </label>
        <input
          id="command-search-input"
          className="command-palette__input"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="true"
          aria-controls="command-results"
          aria-activedescendant={
            results[activeIndex]
              ? `command-option-${results[activeIndex].id}`
              : undefined
          }
          autoComplete="off"
          autoFocus
          value={query}
          placeholder="Search the mission index…"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
        />
        <p className="sr-only" aria-live="polite">
          {results.length} commands available
        </p>
        <div
          id="command-results"
          className="command-palette__results"
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="command-palette__empty">
              No matching mission command.
            </p>
          ) : (
            results.map((command, index) => (
              <button
                id={`command-option-${command.id}`}
                key={command.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={
                  index === activeIndex
                    ? "command-palette__option is-active"
                    : "command-palette__option"
                }
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(command)}
              >
                <span className="command-palette__kind">
                  {command.category}
                </span>
                <span>
                  <strong>{command.label}</strong>
                  <small>{command.description}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))
          )}
        </div>
        <div className="command-palette__footer">
          <span>↑↓ Navigate</span>
          <span>Enter Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
