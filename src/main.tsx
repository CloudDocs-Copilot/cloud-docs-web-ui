import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.tsx";
import { PageProvider } from "./context/PageProvider.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
import OrganizationProvider from "./context/OrganizationProvider";
import { ToastProvider } from './context/ToastProvider';
import NotificationsProvider from './context/NotificationsProvider';
import ErrorBoundary from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <OrganizationProvider>
              <NotificationsProvider>
                <PageProvider>
                  <App />
                </PageProvider>
              </NotificationsProvider>
            </OrganizationProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
