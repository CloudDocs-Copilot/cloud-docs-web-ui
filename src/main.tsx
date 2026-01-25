
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.tsx";
import { PageProvider } from "./context/PageProvider.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PageProvider>
          <App />
        </PageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
