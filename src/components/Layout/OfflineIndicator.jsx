import { useEffect, useState } from "react";

export default function OfflineIndicator() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      className={
        "offline-indicator " +
        (online ? "offline-indicator--online" : "offline-indicator--offline")
      }
      role="status"
      aria-live="polite"
    >
      {online ? "Online" : "Offline — using cached content"}
    </div>
  );
}
