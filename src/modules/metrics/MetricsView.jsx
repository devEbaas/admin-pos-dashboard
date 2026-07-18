import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const STAT_CARDS = [
  { key: "totalClients", label: "Tiendas totales", color: "text-text-primary" },
  { key: "totalActiveLicenses", label: "Licencias activas", color: "text-success" },
  { key: "totalUsers", label: "Usuarios totales", color: "text-text-primary" },
  { key: "totalCodesGenerated", label: "Códigos generados", color: "text-accent-text" },
];

export default function MetricsView() {
  const { call } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    call("/admin/metrics")
      .then(setMetrics)
      .catch((err) => setError(err.message));
  }, [call]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!metrics) return <p className="text-sm text-text-muted">Cargando...</p>;

  const totalDevices = Math.max(metrics.desktopLicenseCount + metrics.mobileLicenseCount, 1);
  const desktopPct = Math.round((metrics.desktopLicenseCount / totalDevices) * 100);
  const mobilePct = Math.round((metrics.mobileLicenseCount / totalDevices) * 100);

  return (
    <div>
      <div className="text-2xl font-bold tracking-tight text-text-primary mb-1.5">Métricas</div>
      <div className="mb-7 text-[13.5px] text-text-muted">
        Panorama general de la red Absolute POS
      </div>

      <div className="grid gap-4 mb-7" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="p-5 border rounded-2xl bg-surface border-border">
            <div className="mb-2 text-xs text-text-muted">{card.label}</div>
            <div className={`text-[28px] font-bold ${card.color}`}>{metrics[card.key]}</div>
          </div>
        ))}
      </div>

      <div className="p-[22px] bg-surface border border-border rounded-2xl">
        <div className="mb-4 text-[13.5px] font-bold text-text-secondary">
          Licencias por tipo de dispositivo
        </div>
        <div className="flex flex-col gap-3.5">
          <div>
            <div className="flex justify-between mb-1.5 text-[12.5px] text-text-secondary">
              <span>🖥 Escritorio</span>
              <span>{metrics.desktopLicenseCount}</span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-surface-2">
              <div className="h-full transition-all rounded bg-accent" style={{ width: `${desktopPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5 text-[12.5px] text-text-secondary">
              <span>📱 Móvil</span>
              <span>{metrics.mobileLicenseCount}</span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-surface-2">
              <div className="h-full transition-all rounded bg-success" style={{ width: `${mobilePct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
