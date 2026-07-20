import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { useAuth } from "../../../context/AuthContext";
import { Badge } from "../../../components/Badge";

// Formato del QR: URI custom "absolutepos://pair?slug=...&code=..." — un
// futuro cliente mobile puede registrarse como handler de este esquema. El
// wizard de escritorio (absolute-pos-app) sigue pidiendo slug+código a mano,
// el QR es un atajo adicional, no un requisito.
function buildPairingUri(slug, code) {
  const params = new URLSearchParams({ slug, code });
  return `absolutepos://pair?${params.toString()}`;
}

function formatCountdown(ms) {
  if (ms <= 0) return "expirado";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function relativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

function codeStatus(code) {
  if (code.usedAt) return { label: "Usado", variant: "neutral" };
  if (new Date(code.expiresAt) < new Date()) return { label: "Expirado", variant: "danger" };
  return { label: "Activo", variant: "success" };
}

const TYPE_OPTIONS = [
  { value: "desktop", label: "🖥 Escritorio" },
  { value: "mobile", label: "📱 Móvil" },
];

export function PairingTab({ business, pairingCodes, onGenerated }) {
  const { call } = useAuth();
  const [deviceType, setDeviceType] = useState("desktop");
  const [current, setCurrent] = useState(null); // { code, platform, expiresAt }
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!current) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [current]);

  const generate = useCallback(async () => {
    setError("");
    setGenerating(true);
    try {
      const result = await call(`/admin/businesses/${business.id}/devices/pairing-codes`, {
        method: "POST",
        body: { deviceType },
      });
      setCurrent(result);
      const uri = buildPairingUri(business.slug, result.code);
      setQrDataUrl(await QRCode.toDataURL(uri, { margin: 1, width: 132 }));
      onGenerated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [call, business, deviceType, onGenerated]);

  const remainingMs = current ? new Date(current.expiresAt).getTime() - now : 0;

  return (
    <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <div className="p-[22px] bg-surface border border-border rounded-2xl animate-[slideUp_0.25s_ease]">
        <div className="mb-3.5 text-sm font-bold text-text-primary">Generar código</div>
        <div className="mb-2 text-xs text-text-muted">Tipo de dispositivo</div>
        <div className="flex gap-2 mb-[18px]">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDeviceType(opt.value)}
              className={`flex-1 py-2.5 rounded-[7px] text-[12.5px] font-semibold transition-colors border ${
                deviceType === opt.value
                  ? "bg-accent-soft border-accent text-accent-text"
                  : "bg-surface-2 border-border-strong text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-3 text-xs text-danger">{error}</div>}

        <button
          onClick={generate}
          disabled={generating}
          className="w-full py-3 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {generating ? "Generando..." : "Generar código"}
        </button>

        {current && (
          <div className="mt-[22px] pt-5 border-t border-border-soft text-center animate-[scaleIn_0.3s_ease]">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR de emparejamiento" className="mx-auto mb-3.5 rounded-[10px]" width={132} height={132} />
            ) : (
              <div className="w-[132px] h-[132px] mx-auto mb-3.5 rounded-[10px] border border-border-strong" />
            )}
            <div className="font-mono text-[28px] font-bold tracking-[0.15em] text-text-primary mb-1.5">
              {current.code}
            </div>
            <div className="text-xs text-text-muted">
              {current.platform === "mobile" ? "📱 Móvil" : "🖥 Escritorio"} · expira en{" "}
              {remainingMs > 0 ? formatCountdown(remainingMs) : "expirado"}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden border rounded-2xl bg-surface border-border">
        <div className="px-5 py-4 text-[13px] font-bold text-text-secondary border-b border-border-soft">
          Historial de códigos
        </div>
        {(!pairingCodes || pairingCodes.length === 0) ? (
          <div className="p-8 text-center text-[13px] text-text-muted">
            Aún no se han generado códigos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {pairingCodes.map((row) => {
                  const status = codeStatus(row);
                  return (
                    <tr key={row.id} className="border-b border-border-soft last:border-0">
                      <td className="px-5 py-3 font-mono text-[13px] text-text-primary whitespace-nowrap">{row.code}</td>
                      <td className="px-5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">
                        {row.platform === "mobile" ? "📱 Móvil" : "🖥 Escritorio"}
                      </td>
                      <td className="px-5 py-3 text-xs text-text-muted whitespace-nowrap">{relativeTime(row.createdAt)}</td>
                      <td className="px-5 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
