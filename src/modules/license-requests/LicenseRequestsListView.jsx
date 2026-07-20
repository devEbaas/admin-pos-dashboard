import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/Badge";

const STATUS_BADGE = {
  pending: { variant: "accent", label: "Pendiente" },
  active: { variant: "success", label: "Activa" },
  revoked: { variant: "danger", label: "Revocada" },
};

function relativeTime(dateString) {
  if (!dateString) return "nunca";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

// Bandeja de solicitudes de licencia enviadas por instalaciones de escritorio
// ya emparejadas (POST /devices/license/request) — no confundir con el tab
// "Licencias" del detalle de negocio, que en realidad lista Device (pairing),
// no este modelo License nuevo.
export default function LicenseRequestsListView() {
  const { call } = useAuth();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const query = showAll ? "" : "?status=pending";
      setRequests(await call(`/admin/license-requests${query}`));
    } catch (err) {
      setError(err.message);
    }
  }, [call, showAll]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (request) => {
    setActingId(request.id);
    try {
      await call(`/admin/license-requests/${request.id}/approve`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleRevoke = async (request) => {
    if (!window.confirm(`¿Revocar la licencia de "${request.device?.label}"?`)) return;
    setActingId(request.id);
    try {
      await call(`/admin/license-requests/${request.id}/revoke`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-2xl font-bold tracking-tight text-text-primary">
            Solicitudes de licencia
          </div>
          <div className="mt-1 text-[13.5px] text-text-muted">
            Activaciones pedidas desde instalaciones de escritorio ya emparejadas
          </div>
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex-shrink-0 px-[18px] py-2.5 text-[13.5px] font-bold rounded-[9px] bg-surface border border-border text-text-primary hover:border-accent transition-all"
        >
          {showAll ? "Ver solo pendientes" : "Ver todas"}
        </button>
      </div>

      {error && <div className="mb-4 text-[13px] text-danger">{error}</div>}

      {requests === null && !error && (
        <p className="text-sm text-text-muted">Cargando...</p>
      )}

      {requests?.length === 0 && (
        <p className="text-sm text-text-muted">
          {showAll ? "Todavía no hay solicitudes de licencia." : "No hay solicitudes pendientes."}
        </p>
      )}

      {requests?.length > 0 && (
        <div className="overflow-hidden border rounded-2xl bg-surface border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-soft">
                  {["Negocio", "Dispositivo", "Solicitada", "Estado", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[11.5px] font-semibold tracking-wider text-left uppercase text-text-muted whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const badge = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
                  return (
                    <tr key={r.id} className="border-b border-border-soft last:border-0">
                      <td className="px-5 py-3.5 text-[13.5px] text-text-primary whitespace-nowrap">
                        {r.device?.business?.name}
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] text-text-primary whitespace-nowrap">
                        {r.device?.platform === "mobile" ? "📱" : "🖥"} {r.device?.label}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                        {relativeTime(r.requestedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {r.status === "pending" && (
                          <button
                            onClick={() => handleApprove(r)}
                            disabled={actingId === r.id}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-success-soft text-success hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {actingId === r.id ? "Activando..." : "Activar"}
                          </button>
                        )}
                        {r.status === "active" && (
                          <button
                            onClick={() => handleRevoke(r)}
                            disabled={actingId === r.id}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-danger-soft text-danger hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {actingId === r.id ? "Revocando..." : "Revocar"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
