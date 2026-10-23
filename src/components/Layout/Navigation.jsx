import { NavLink } from "react-router-dom";
import LanguageSwitch from "./LanguageSwitch.jsx";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/library", label: "Library" },
  { to: "/assistant", label: "Assistant" },
  { to: "/quiz", label: "Quiz" },
  { to: "/progress", label: "Progress" },
  { to: "/manage", label: "Manage" },
];

export default function Navigation() {
  return (
    <header className="app-header">
      <nav className="app-nav" aria-label="Main navigation">
        <div className="app-brand">
          <span className="app-brand-mark" aria-hidden="true">
            RL
          </span>
          <span className="app-brand-text">RuralLearn</span>
        </div>
        <ul className="app-nav-list">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  "app-nav-link" + (isActive ? " app-nav-link--active" : "")
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <LanguageSwitch />
      </nav>
    </header>
  );
}
