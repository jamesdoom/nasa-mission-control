import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { MarkIcon } from "./Icons";

const moduleLinks = [
  { to: "/apod", label: "APOD" },
  { to: "/asteroids", label: "Asteroid Watch" },
  { to: "/media", label: "Media Library" },
  { to: "/space-weather", label: "Space Weather" },
  { to: "/earth", label: "Earth" },
  { to: "/missions", label: "Missions" },
  { to: "/trivia", label: "Trivia" },
];

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/apod": "Astronomy Picture of the Day",
  "/asteroids": "Asteroid Watch",
  "/media": "NASA Media Library",
  "/space-weather": "Space Weather Center",
  "/earth": "Earth Observatory",
  "/missions": "Mission Archive",
  "/trivia": "Space Trivia",
  "/favorites": "Personal Flight Log",
  "/about": "About",
};

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const modulesActive = moduleLinks.some(
    ({ to }) =>
      location.pathname === to || location.pathname.startsWith(`${to}/`),
  );

  useEffect(() => {
    const basePath = `/${location.pathname.split("/").find(Boolean) ?? ""}`;
    const title = routeTitles[basePath] ?? "Mission Control";
    document.title = `${title} | NASA Mission Control`;
    setOpen(false);
    setModulesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!navigationRef.current?.contains(event.target as Node))
        setModulesOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setModulesOpen(false);
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
        <div className="system-status">
          <span className="status-dot" />
          SYSTEMS NOMINAL
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
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
    </div>
  );
}
