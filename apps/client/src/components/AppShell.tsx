import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { MarkIcon } from "./Icons";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/apod", label: "APOD" },
  { to: "/asteroids", label: "Asteroid Watch" },
  { to: "/media", label: "Media Library" },
  { to: "/favorites", label: "Flight Log" },
  { to: "/about", label: "About" },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
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
          id="primary-nav"
          aria-label="Primary"
          className={open ? "nav nav--open" : "nav"}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
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
