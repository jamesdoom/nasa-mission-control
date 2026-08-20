import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { MarkIcon, SearchIcon } from "./Icons";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

const moduleLinks = [
  { to: "/search", label: "Discovery Index" },
  { to: "/apod", label: "APOD" },
  { to: "/asteroids", label: "Asteroid Watch" },
  { to: "/media", label: "Media Library" },
  { to: "/space-weather", label: "Space Weather" },
  { to: "/earth", label: "Earth" },
  { to: "/missions", label: "Missions" },
  { to: "/missions/map", label: "Mission Map" },
  { to: "/scale-lab", label: "Scale Lab" },
  { to: "/trivia", label: "Trivia" },
  { to: "/discover", label: "Discovery Paths" },
];

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/search": "Unified Discovery Index",
  "/apod": "Astronomy Picture of the Day",
  "/asteroids": "Asteroid Watch",
  "/media": "NASA Media Library",
  "/space-weather": "Space Weather Center",
  "/earth": "Earth Observatory",
  "/missions": "Mission Archive",
  "/missions/compare": "Mission Comparison",
  "/missions/map": "Solar-system Mission Map",
  "/scale-lab": "Celestial Scale Laboratory",
  "/trivia": "Space Trivia",
  "/discover": "Guided Discovery",
  "/favorites": "Personal Flight Log",
  "/about": "About",
};

function titleForPath(pathname: string): string {
  const basePath = `/${pathname.split("/").find(Boolean) ?? ""}`;
  return routeTitles[pathname] ?? routeTitles[basePath] ?? "Mission Control";
}

const CommandPalette = lazy(() =>
  import("./CommandPalette").then((module) => ({
    default: module.CommandPalette,
  })),
);

function prefersReducedMotion() {
  const matchMedia = Reflect.get(window, "matchMedia") as unknown;
  if (typeof matchMedia !== "function") return false;
  const query = Reflect.apply(matchMedia, window, [
    "(prefers-reduced-motion: reduce)",
  ]) as unknown;
  return (
    typeof query === "object" &&
    query !== null &&
    Reflect.get(query, "matches") === true
  );
}

function animateRouteArrival(element: HTMLElement) {
  const animate = Reflect.get(element, "animate") as unknown;
  if (typeof animate !== "function") return;
  Reflect.apply(animate, element, [
    [
      { opacity: 0.58, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  ]);
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const online = useNetworkStatus();
  const modulesActive = moduleLinks.some(
    ({ to }) =>
      location.pathname === to || location.pathname.startsWith(`${to}/`),
  );

  useEffect(() => {
    const title = titleForPath(location.pathname);
    document.title = `${title} | NASA Mission Control`;
    setOpen(false);
    setModulesOpen(false);
    if (previousPath.current !== location.pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      mainRef.current?.focus({ preventScroll: true });
      if (mainRef.current && !prefersReducedMotion())
        animateRouteArrival(mainRef.current);
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

  const routeTitle = titleForPath(location.pathname);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!navigationRef.current?.contains(event.target as Node))
        setModulesOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setModulesOpen(false);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <NavLink
          to="/"
          className="brand"
          aria-label="NASA Mission Control home"
        >
          <MarkIcon />
          <span>
            <strong>MISSION</strong> CONTROL
          </span>
        </NavLink>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span />
          <span />
          <span />
        </button>
        <nav
          ref={navigationRef}
          id="primary-nav"
          aria-label="Primary"
          className={open ? "nav nav--open" : "nav"}
        >
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <div className="nav-disclosure">
            <button
              type="button"
              className={modulesActive ? "is-active" : ""}
              aria-expanded={modulesOpen}
              aria-controls="module-navigation"
              onClick={() => setModulesOpen((value) => !value)}
            >
              Explore <span aria-hidden="true">⌄</span>
            </button>
            <div
              id="module-navigation"
              className={
                modulesOpen ? "module-nav module-nav--open" : "module-nav"
              }
            >
              <p>Mission instruments</p>
              {moduleLinks.map((link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={
                    link.to === "/missions" &&
                    location.pathname === "/missions/map"
                  }
                  onClick={() => setModulesOpen(false)}
                >
                  <span>0{index + 1}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <NavLink to="/favorites">Flight Log</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <button
          className="command-trigger"
          type="button"
          aria-label="Open command search"
          aria-haspopup="dialog"
          aria-expanded={commandOpen}
          onClick={() => setCommandOpen(true)}
        >
          <SearchIcon />
          <span>Search</span>
          <kbd>Ctrl K</kbd>
        </button>
        <div className={online ? "system-status" : "system-status is-offline"}>
          <span className="status-dot" aria-hidden="true" />
          {online ? "SYSTEMS NOMINAL" : "LOCAL MODE"}
        </div>
      </header>
      {online ? null : (
        <div className="connectivity-banner" role="status">
          <strong>Network link offline.</strong>
          <span>
            Saved Flight Log records remain available. Live NASA instruments
            will reconnect when this browser is online.
          </span>
        </div>
      )}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {routeTitle} loaded
      </p>
      <main ref={mainRef} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div>
          <MarkIcon size={24} />
          <span>NASA Mission Control</span>
        </div>
        <p>
          Built with public NASA data. Background by Pexels via Pixabay. Not an
          official NASA product.
        </p>
        <a href="https://images.nasa.gov/" target="_blank" rel="noreferrer">
          Explore NASA media <span aria-hidden="true">↗</span>
        </a>
      </footer>
      {commandOpen ? (
        <Suspense fallback={null}>
          <CommandPalette onClose={() => setCommandOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
}
