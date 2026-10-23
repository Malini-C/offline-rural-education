// Wraps the browser's beforeinstallprompt event so the app can present
// an in-app Install button at a moment the user chooses, instead of
// relying only on the browser's own prompt UI.
//
// Fires only in browsers that support PWA install (Chrome, Edge, Opera on
// desktop and Android). Firefox desktop and Safari iOS do not fire this
// event; the app shows an alternative message in those environments.

import { useEffect, useState } from "react";

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }
    function handleInstalled() {
      setDeferredPrompt(null);
      setInstalled(true);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    // Detect "already installed" from the display mode.
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return { outcome: "unavailable" };
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      return { outcome: "accepted" };
    }
    return { outcome: "dismissed" };
  }

  return {
    canInstall: Boolean(deferredPrompt),
    installed,
    promptInstall,
  };
}
