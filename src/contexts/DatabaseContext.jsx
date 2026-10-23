import { createContext, useContext, useEffect, useState } from "react";
import { ensureSeedLoaded } from "../db/seed.js";
import { isIndexedDBAvailable } from "../db/database.js";

const DatabaseContext = createContext(null);

export function DatabaseProvider({ children }) {
  const [status, setStatus] = useState("init");
  const [error, setError] = useState(null);
  const [seedInfo, setSeedInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isIndexedDBAvailable()) {
        setStatus("unavailable");
        setError(
          "IndexedDB is not available in this browser. The app will not be able to save progress. This often happens in private browsing mode.",
        );
        return;
      }
      try {
        const result = await ensureSeedLoaded();
        if (cancelled) return;
        setSeedInfo(result);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("Database initialization failed:", err);
        setError(err.message);
        setStatus("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ status, error, seedInfo }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error("useDatabase must be used inside <DatabaseProvider>");
  }
  return ctx;
}
