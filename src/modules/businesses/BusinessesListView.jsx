import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NewBusinessModal } from "./components/NewBusinessModal";

export default function BusinessesListView() {
  const { call } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState(null);
  const [error, setError] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const load = useCallback(async () => {
    try {
      setBusinesses(await call("/admin/businesses"));
    } catch (err) {
      setError(err.message);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreated = () => {
    setShowNewModal(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold tracking-tight text-text-primary">Clientes</div>
          <div className="mt-1 text-[13.5px] text-text-muted">
            Tiendas registradas en Absolute POS
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-[18px] py-2.5 text-[13.5px] font-bold rounded-[9px] bg-accent text-bg hover:bg-accent-hover active:scale-[0.97] transition-all"
        >
          + Nueva tienda
        </button>
      </div>

      {error && <div className="mb-4 text-[13px] text-danger">{error}</div>}

      {businesses === null && !error && (
        <p className="text-sm text-text-muted">Cargando...</p>
      )}

      {businesses?.length === 0 && (
        <p className="text-sm text-text-muted">Todavía no hay negocios registrados.</p>
      )}

      {businesses?.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {businesses.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/businesses/${b.id}`)}
              className="p-5 transition-all border cursor-pointer rounded-2xl bg-surface border-border hover:border-accent hover:-translate-y-0.5 animate-[slideUp_0.3s_ease]"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[16px] font-bold text-text-primary">{b.name}</div>
                <div className="font-mono text-[10.5px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                  {b.id.slice(0, 8)}
                </div>
              </div>
              <div className="font-mono text-[12.5px] text-accent-text mb-3.5">/{b.slug}</div>
              <div className="flex gap-4 pt-3.5 border-t border-border-soft">
                <div>
                  <div className="text-[15px] font-bold text-text-primary">{b.userCount}</div>
                  <div className="text-[11px] text-text-muted">Usuarios</div>
                </div>
                <div>
                  <div className="text-[15px] font-bold text-success">{b.activeLicenseCount}</div>
                  <div className="text-[11px] text-text-muted">Licencias activas</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewModal && (
        <NewBusinessModal onClose={() => setShowNewModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
