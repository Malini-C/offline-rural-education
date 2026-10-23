import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DatabaseProvider } from "./contexts/DatabaseContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import AppShell from "./components/Layout/AppShell.jsx";
import SkipLink from "./components/Layout/skipLink.jsx";
import HomePage from "./pages/HomePage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import LessonPage from "./pages/LessonPage.jsx";
import AssistantPage from "./pages/AssistantPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import ManageContentPage from "./pages/ManageContentPage.jsx";
import UpdateToast from "./components/PWA/UpdateToast.jsx";
import InstallPrompt from "./components/PWA/InstallPrompt.jsx";
import { initServiceWorker } from "./pwa/registerSW.js";

export default function App() {
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    initServiceWorker({
      onNeedRefresh: () => setShowUpdateToast(true),
      onOfflineReady: () => {},
    });
  }, []);

  return (
    <LanguageProvider>
      <DatabaseProvider>
        <SkipLink />
        <AppShell>
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/:lessonId" element={<LessonPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/manage" element={<ManageContentPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
        <UpdateToast
          visible={showUpdateToast}
          onDismiss={() => setShowUpdateToast(false)}
        />
      </DatabaseProvider>
    </LanguageProvider>
  );
}
