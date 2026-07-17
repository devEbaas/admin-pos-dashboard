import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("platformAdminToken"));
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem("platformAdmin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("platformAdminToken");
    localStorage.removeItem("platformAdmin");
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiFetch("/platform-admin/login", {
      method: "POST",
      body: { username, password },
    });
    setToken(data.token);
    setAdmin(data.admin);
    localStorage.setItem("platformAdminToken", data.token);
    localStorage.setItem("platformAdmin", JSON.stringify(data.admin));
  }, []);

  // Wrapper de apiFetch que ya trae el token — si el backend responde 401
  // (token vencido/rotado) cierra sesión automáticamente en vez de dejar la
  // UI en un estado de "cargando" indefinido.
  const call = useCallback(
    async (path, options) => {
      try {
        return await apiFetch(path, { ...options, token });
      } catch (err) {
        if (err.status === 401) logout();
        throw err;
      }
    },
    [token, logout],
  );

  const value = { admin, token, isAuthenticated: !!token, login, logout, call };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
