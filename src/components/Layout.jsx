import * as React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/businesses", label: "Clientes" },
  { to: "/metrics", label: "Métricas" },
  { to: "/settings", label: "Configuración" },
  { to: "/admins", label: "Administradores" },
];

const navLinkClass = ({ isActive }) =>
  `text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? "bg-accent-soft text-accent-text" : "text-text-secondary hover:bg-surface"
  }`;

export function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = (admin?.name || admin?.username || "A").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-bg animate-[fadeIn_0.35s_ease]">
      <aside className="flex flex-col flex-shrink-0 w-[230px] gap-6 py-5 px-3.5 bg-sidebar border-r border-border-soft">
        <div className="flex items-center gap-2.5 px-1.5">
          <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 font-mono text-[7px] text-text-muted border border-dashed rounded-[9px] border-border-strong">
            LOGO
          </div>
          <div>
            <div className="text-[14.5px] font-bold leading-tight text-text-primary">
              Absolute POS
            </div>
            <div className="text-[11px] text-text-muted">Admin</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 p-3 mt-auto rounded-[10px] bg-surface">
          <div className="flex items-center justify-center flex-shrink-0 w-[30px] h-[30px] text-xs font-bold rounded-full bg-accent text-bg">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-text-primary truncate">
              {admin?.name || admin?.username}
            </div>
            <div className="text-[11px] text-text-muted">Cuenta raíz</div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex-shrink-0 p-1.5 text-text-muted hover:text-danger transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-10 py-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
