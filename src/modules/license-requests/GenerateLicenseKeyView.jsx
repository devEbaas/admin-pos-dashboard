import * as React from "react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

// Genera la clave de licencia manual (hardware_id -> key HMAC) que tanto el
// desktop (absolute-electron-pos) como la app mobile saben verificar
// localmente sin red. El cálculo vive en el backend
// (POST /admin/license-requests/generate-key) a propósito — nunca en el
// navegador, para no exponer el secreto en el bundle JS del dashboard.
export default function GenerateLicenseKeyView() {
  const { call } = useAuth();
  const [hardwareId, setHardwareId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    const trimmed = hardwareId.trim();
    if (!trimmed) return;
    setError("");
    setResult(null);
    setCopied(false);
    setGenerating(true);
    try {
      const response = await call("/admin/license-requests/generate-key", {
        method: "POST",
        body: { hardwareId: trimmed },
      });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copy = async () => {
    if (!result?.licenseKey) return;
    await navigator.clipboard.writeText(result.licenseKey);
    setCopied(true);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-2xl font-bold tracking-tight text-text-primary">
          Generar licencia manual
        </div>
        <div className="mt-1 text-[13.5px] text-text-muted">
          Para instalaciones offline puro (sin pairing) — pega el hardware ID
          que muestra la pantalla de licencia del cliente y genera su clave.
        </div>
      </div>

      <div className="max-w-md p-[22px] bg-surface border border-border rounded-2xl">
        <div className="mb-2 text-xs text-text-muted">Hardware ID</div>
        <input
          type="text"
          value={hardwareId}
          onChange={(e) => setHardwareId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Ej. A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"
          className="w-full px-3.5 py-2.5 mb-4 font-mono text-[13px] rounded-lg bg-surface-2 border border-border-strong text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />

        {error && <div className="mb-3 text-xs text-danger">{error}</div>}

        <button
          onClick={generate}
          disabled={generating || !hardwareId.trim()}
          className="w-full py-3 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {generating ? "Generando..." : "Generar clave"}
        </button>

        {result && (
          <div className="pt-5 mt-5 text-center border-t border-border-soft animate-[scaleIn_0.3s_ease]">
            <div className="mb-1.5 text-xs text-text-muted">Clave de licencia</div>
            <div className="font-mono text-[17px] font-bold tracking-[0.05em] text-text-primary break-all">
              {result.licenseKey}
            </div>
            <button
              onClick={copy}
              className="px-4 py-2 mt-3 text-xs font-semibold rounded-lg bg-surface-2 border border-border-strong text-text-secondary hover:border-accent transition-colors"
            >
              {copied ? "Copiado ✓" : "Copiar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
