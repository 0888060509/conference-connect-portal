
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { AppProviders } from "./providers/AppProviders";
import { AppRoutes } from "./routes";
import { requestNotificationPermission } from "./utils/notificationUtils";
import { initDataSync } from "./lib/data-sync";

// For demo purposes, force show the app (not landing)
const SHOW_LANDING = false;

const App = () => {
  useEffect(() => {
    requestNotificationPermission();
    initDataSync();

    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }, []);

  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
};

export default App;
