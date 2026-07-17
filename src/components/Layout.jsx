import * as React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
  }`;

export function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            pos-root-dashboard
          </span>
          <nav className="flex items-center gap-1">
            <NavLink to="/businesses" className={navLinkClass}>
              Negocios
            </NavLink>
            <NavLink to="/admins" className={navLinkClass}>
              Admins
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {admin?.name || admin?.username}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="max-w-5xl px-4 py-8 mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
