import { useEffect, useState } from "react";

export default function PWAStatus() {
  const [fromCache, setFromCache] = useState(null);
  const [swActive, setSwActive] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    async function inspect() {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        setSwActive(
          registrations.length > 0 && Boolean(registrations[0].active),
        );
      }
      // The Navigation Timing API marks transfers that came from cache.
      const navEntries = performance.getEntriesByType?.("navigation") ?? [];
      const entry = navEntries[0];
      if (entry && typeof entry.transferSize === "number") {
        setFromCache(entry.transferSize === 0);
      }
    }
    inspect();
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <section className="pwa-status" aria-label="Offline status">
      <h2>Offline status</h2>
      <ul className="pwa-status__list">
        <li>
          <strong>Service worker:</strong>{" "}
          {swActive ? "active" : "not yet registered"}
        </li>
        <li>
          <strong>Current page source:</strong>{" "}
          {fromCache === null
            ? "unknown"
            : fromCache
              ? "served from cache"
              : "fetched from network"}
        </li>
        <li>
          <strong>Network:</strong> {online ? "online" : "offline"}
        </li>
        <li>
          <strong>Install support:</strong>{" "}
          {"serviceWorker" in navigator
            ? "available in this browser"
            : "not available"}
        </li>
      </ul>
      <p className="pwa-status__hint muted">
        RuralLearn works offline after the first visit while connected. To test:
        open DevTools → Network → set to Offline → reload.
      </p>
    </section>
  );
}
