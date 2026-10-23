import Navigation from "./Navigation.jsx";
import OfflineIndicator from "./OfflineIndicator.jsx";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <OfflineIndicator />
      <Navigation />
      <main id="main-content" className="app-main">
        {children}
      </main>
      <footer className="app-footer">
        <p className="muted">
          RuralLearn — offline-first educational assistant. All data stays on
          this device.
        </p>
      </footer>
    </div>
  );
}
