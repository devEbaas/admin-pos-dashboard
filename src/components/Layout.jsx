import * as React from "react";
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/businesses", label: "Clientes" },
  { to: "/license-requests", label: "Solicitudes de licencia" },
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
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // El sidebar es un drawer por debajo de `lg` — ciérralo solo al cambiar de
  // ruta (no en cada render) para no pelear con el propio toggle del botón.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = (admin?.name || admin?.username || "A").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-bg animate-[fadeIn_0.35s_ease]">
      {/* Topbar — solo visible por debajo de `lg`, donde el sidebar pasa a ser un drawer */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between h-14 px-4 border-b lg:hidden bg-sidebar border-border-soft">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-[14.5px] font-bold text-text-primary">Absolute POS</div>
        <div className="w-9" />
      </header>

      {/* Backdrop del drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`flex flex-col flex-shrink-0 w-[230px] gap-6 py-5 px-3.5 bg-sidebar border-r border-border-soft
          fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:z-auto`}
      >
        <div className="flex items-center justify-between px-1.5">
          <div className="flex items-center gap-2.5">
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
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
            className="p-1.5 text-text-muted hover:text-text-primary lg:hidden"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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

      <main className="flex-1 min-w-0 px-4 pt-20 pb-6 overflow-y-auto max-h-screen sm:px-6 lg:px-10 lg:py-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
