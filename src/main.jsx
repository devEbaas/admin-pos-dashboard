import * as React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import LoginView from "./modules/auth/LoginView";
import BusinessesListView from "./modules/businesses/BusinessesListView";
import BusinessDetailView from "./modules/businesses/BusinessDetailView";
import LicenseRequestsListView from "./modules/license-requests/LicenseRequestsListView";
import OfflineLicenseRequestsListView from "./modules/offline-license-requests/OfflineLicenseRequestsListView";
import GenerateLicenseKeyView from "./modules/license-requests/GenerateLicenseKeyView";
import DemoRequestsListView from "./modules/demo-requests/DemoRequestsListView";
import WebQuoteRequestsListView from "./modules/web-quote-requests/WebQuoteRequestsListView";
import AdminsView from "./modules/admins/AdminsView";
import MetricsView from "./modules/metrics/MetricsView";
import SettingsView from "./modules/settings/SettingsView";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/businesses" element={<BusinessesListView />} />
            <Route path="/businesses/:id" element={<BusinessDetailView />} />
            <Route path="/license-requests" element={<LicenseRequestsListView />} />
            <Route path="/offline-license-requests" element={<OfflineLicenseRequestsListView />} />
            <Route path="/generate-license" element={<GenerateLicenseKeyView />} />
            <Route path="/demo-requests" element={<DemoRequestsListView />} />
            <Route path="/web-quote-requests" element={<WebQuoteRequestsListView />} />
            <Route path="/admins" element={<AdminsView />} />
            <Route path="/metrics" element={<MetricsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Route>

          <Route path="*" element={<Navigate to="/businesses" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
