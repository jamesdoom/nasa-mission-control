import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localDiscoveryIndex } from "../data/discoveryIndex";
import { SearchIcon } from "./Icons";

type Command = {
  id: string;
  label: string;
  description: string;
  category: "Instrument" | "Mission" | "Discovery" | "Utility";
  to: string;
  keywords: string;
};
const RECENT_SEARCHES_KEY = "mission-control:command-search-history:v1";
const suggestions = ["Moon", "Mars", "Heliophysics", "Live", "Curated"];

function readRecentSearches(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (item): item is string =>
              typeof item === "string" && item.length <= 100,
          )
          .slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

const categoryLabels = {
  instrument: "Instrument",
  mission: "Mission",
  path: "Discovery",
  story: "Discovery",
  saved: "Utility",
} as const;

const commands: Command[] = localDiscoveryIndex.map((result) => ({
  id: result.id,
  label: result.title,
  description: result.description,
  category: categoryLabels[result.kind],
  to: result.to,
  keywords: result.keywords,
}));

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(readRecentSearches);
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
    rememberQuery(query);
    void navigate(command.to);
    onClose();
  }

  function rememberQuery(value: string) {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [
      normalized,
      ...recentSearches.filter(
        (item) => item.toLocaleLowerCase() !== normalized.toLocaleLowerCase(),
      ),
    ].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
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
          className="command-palette__suggestions"
          aria-label={
            query ? "Suggested filters" : "Recent searches and suggestions"
          }
        >
          {!query &&
            recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  setActiveIndex(0);
                }}
              >
                Recent: {item}
              </button>
            ))}
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item);
                setActiveIndex(0);
              }}
            >
              {item}
            </button>
          ))}
        </div>
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
        {results[activeIndex] ? (
          <aside className="command-palette__preview" aria-live="polite">
            <span className="telemetry">Keyboard preview</span>
            <strong>{results[activeIndex].label}</strong>
            <p>{results[activeIndex].description}</p>
            <small>
              {results[activeIndex].category} · Enter opens this record
            </small>
          </aside>
        ) : null}
        <div className="command-palette__footer">
          <button
            type="button"
            onClick={() => {
              rememberQuery(query);
              const params = new URLSearchParams();
              if (query.trim()) params.set("q", query.trim());
              void navigate(`/search${params.size > 0 ? `?${params}` : ""}`);
              onClose();
            }}
          >
            Search NASA media and Flight Log →
          </button>
          <span>↑↓ Navigate · Enter Open · Esc Close</span>
        </div>
      </div>
    </div>
  );
}
