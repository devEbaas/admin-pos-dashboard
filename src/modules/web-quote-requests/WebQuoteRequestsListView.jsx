import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/Badge";

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

// Bandeja de confirmaciones enviadas desde el formulario de una cotización
// publicada en el sitio de marketing (absolute-systems-web, POST
// /web-quote-requests) — leads de un prospecto al que le mandamos una
// cotización, a diferencia de "Solicitudes de demo" que son de alguien
// interesado en Absolute POS en general.
export default function WebQuoteRequestsListView() {
  const { call } = useAuth();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  // Derivado de `requests` (no una copia propia) para que el modal siempre
  // refleje el estado más reciente después de marcar contactada/confirmada.
  const selected = requests?.find((r) => r.id === selectedId) || null;

  const load = useCallback(async () => {
    try {
      const query = showAll ? "" : "?contacted=false";
      setRequests(await call(`/admin/web-quote-requests${query}`));
    } catch (err) {
      setError(err.message);
    }
  }, [call, showAll]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkContacted = async (request) => {
    setActingId(request.id);
    try {
      await call(`/admin/web-quote-requests/${request.id}/contacted`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  // La mayoría confirma por WhatsApp o en persona, no por el formulario —
  // este estado es independiente de "contactada" y lo activa el admin a
  // mano.
  const handleMarkConfirmed = async (request) => {
    setActingId(request.id);
    try {
      await call(`/admin/web-quote-requests/${request.id}/confirmed`, { method: "POST" });
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
            Cotizaciones web
          </div>
          <div className="mt-1 text-[13.5px] text-text-muted">
            Confirmaciones enviadas desde una cotización del sitio de marketing
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
          {showAll ? "Todavía no hay cotizaciones confirmadas." : "No hay confirmaciones pendientes."}
        </p>
      )}

      {requests?.length > 0 && (
        <div className="overflow-hidden border rounded-2xl bg-surface border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-soft">
                  {["Nombre", "Contacto", "Código", "Mensaje", "Enviada", "Estado", "Acciones"].map((h) => (
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
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-border-soft last:border-0">
                    <td className="px-5 py-3.5 text-[13.5px] text-text-primary whitespace-nowrap">
                      {r.name}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-text-primary whitespace-nowrap">
                      {r.contact}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-text-primary whitespace-nowrap">
                      {r.quoteCode}
                    </td>
                    <td
                      className="px-5 py-3.5 text-[13.5px] text-text-primary max-w-[240px] truncate cursor-pointer hover:underline"
                      title={r.message ? "Ver mensaje completo" : ""}
                      onClick={() => setSelectedId(r.id)}
                    >
                      {r.message || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                      {relativeTime(r.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        <Badge variant={r.contacted ? "success" : "accent"}>
                          {r.contacted ? "Contactada" : "Pendiente"}
                        </Badge>
                        {r.confirmed && <Badge variant="success">Confirmada</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedId(r.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-neutral-soft text-text-secondary hover:brightness-125 transition-all whitespace-nowrap"
                        >
                          Ver
                        </button>
                        {!r.contacted && (
                          <button
                            onClick={() => handleMarkContacted(r)}
                            disabled={actingId === r.id}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-success-soft text-success hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {actingId === r.id ? "Guardando..." : "Marcar contactada"}
                          </button>
                        )}
                        {!r.confirmed && (
                          <button
                            onClick={() => handleMarkConfirmed(r)}
                            disabled={actingId === r.id}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-accent-soft text-accent-text hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {actingId === r.id ? "Guardando..." : "Marcar confirmada"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(0.1_0.01_260_/_0.6)]"
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-surface border border-border-strong rounded-2xl p-6 sm:p-7 animate-[scaleIn_0.25s_ease]"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[17px] font-bold text-text-primary">{selected.name}</div>
                <div className="text-[12.5px] text-text-muted">
                  {selected.quoteCode} · {new Date(selected.createdAt).toLocaleString("es-MX")}
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Cerrar"
                className="p-1 -mt-1 -mr-1 text-text-muted hover:text-text-primary"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-1.5 mb-4">
              <Badge variant={selected.contacted ? "success" : "accent"}>
                {selected.contacted ? "Contactada" : "Pendiente"}
              </Badge>
              {selected.confirmed && <Badge variant="success">Confirmada</Badge>}
            </div>

            <div className="mb-4">
              <div className="text-[11.5px] font-semibold tracking-wider uppercase text-text-muted mb-1">
                Contacto
              </div>
              <div className="text-[13.5px] text-text-primary">{selected.contact}</div>
            </div>

            <div className="mb-5">
              <div className="text-[11.5px] font-semibold tracking-wider uppercase text-text-muted mb-1">
                Mensaje
              </div>
              <div className="text-[13.5px] text-text-primary whitespace-pre-wrap">
                {selected.message || "Sin mensaje."}
              </div>
            </div>

            <div className="flex gap-2.5">
              {!selected.contacted && (
                <button
                  onClick={() => handleMarkContacted(selected)}
                  disabled={actingId === selected.id}
                  className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg bg-success-soft text-success hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actingId === selected.id ? "Guardando..." : "Marcar contactada"}
                </button>
              )}
              {!selected.confirmed && (
                <button
                  onClick={() => handleMarkConfirmed(selected)}
                  disabled={actingId === selected.id}
                  className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg bg-accent-soft text-accent-text hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actingId === selected.id ? "Guardando..." : "Marcar confirmada"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
