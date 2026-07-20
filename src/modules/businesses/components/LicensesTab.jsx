import * as React from "react";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Badge } from "../../../components/Badge";

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

// "Licencia" es Device renombrado en la UI — mismo dato, terminología más
// clara para el operador (ver plan de rediseño). Sin campo de expiración
// real todavía: el estado solo distingue Activa/Revocada.
export function LicensesTab({ businessId, devices, onChanged }) {
  const { call } = useAuth();
  const [revokingId, setRevokingId] = useState(null);

  const handleRevoke = async (device) => {
    if (!window.confirm(`¿Revocar "${device.label}"? Dejará de sincronizar de inmediato.`)) {
      return;
    }
    setRevokingId(device.id);
    try {
      await call(`/admin/businesses/${businessId}/devices/${device.id}/revoke`, { method: "POST" });
      onChanged?.();
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 text-[13px] text-text-muted">
        Licencias vinculadas a dispositivos de esta tienda
      </div>
      <div className="overflow-hidden border rounded-2xl bg-surface border-border">
        {(!devices || devices.length === 0) ? (
          <div className="p-8 text-center text-[13px] text-text-muted">
            Sin licencias todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-soft">
                  {["Dispositivo", "Activada", "Últ. conexión", "Estado", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11.5px] font-semibold tracking-wider text-left uppercase text-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id} className="border-b border-border-soft last:border-0">
                    <td className="px-5 py-3.5 text-[13.5px] text-text-primary whitespace-nowrap">
                      {d.platform === "mobile" ? "📱" : "🖥"} {d.label}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">{relativeTime(d.createdAt)}</td>
                    <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">{relativeTime(d.lastSeenAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={d.revokedAt ? "danger" : "success"}>
                        {d.revokedAt ? "Revocada" : "Activa"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!d.revokedAt && (
                        <button
                          onClick={() => handleRevoke(d)}
                          disabled={revokingId === d.id}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-danger-soft text-danger hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {revokingId === d.id ? "Revocando..." : "Revocar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
