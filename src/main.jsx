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
