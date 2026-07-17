import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { useAuth } from "../../../context/AuthContext";

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

export function PairingCodeModal({ business, onClose }) {
  const { call } = useAuth();
  const [deviceType, setDeviceType] = useState("desktop");
  const [pairing, setPairing] = useState(null); // { code, platform, expiresAt }
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!pairing) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [pairing]);

  const generate = useCallback(async () => {
    setError("");
    setGenerating(true);
    setQrDataUrl(null);
    try {
      const result = await call(`/admin/businesses/${business.id}/devices/pairing-codes`, {
        method: "POST",
        body: { deviceType },
      });
      setPairing(result);
      const uri = buildPairingUri(business.slug, result.code);
      setQrDataUrl(await QRCode.toDataURL(uri, { margin: 1, width: 220 }));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [call, business, deviceType]);

  const remainingMs = pairing ? new Date(pairing.expiresAt).getTime() - now : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800"
      >
        <h2 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          Emparejar dispositivo
        </h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          {business.name} ({business.slug})
        </p>

        {error && (
          <div className="px-3 py-2 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!pairing && (
          <>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de dispositivo
            </label>
            <div className="flex gap-2 mb-5">
              {[
                { value: "desktop", label: "Escritorio" },
                { value: "mobile", label: "Celular" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeviceType(opt.value)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    deviceType === opt.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={generate}
              disabled={generating}
              className="w-full py-2.5 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? "Generando..." : "Generar código"}
            </button>
          </>
        )}

        {pairing && (
          <div className="text-center">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR de emparejamiento"
                className="mx-auto mb-4 rounded-lg"
                width={220}
                height={220}
              />
            )}
            <p className="mb-1 font-mono text-2xl font-bold tracking-widest text-gray-900 dark:text-white">
              {pairing.code}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              slug: <span className="font-mono">{business.slug}</span> · tipo: {pairing.platform}
            </p>
            <p
              className={`mt-2 text-sm font-medium ${
                remainingMs <= 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {remainingMs <= 0 ? "Código expirado" : `Expira en ${formatCountdown(remainingMs)}`}
            </p>
            <button
              onClick={() => setPairing(null)}
              className="w-full py-2 mt-4 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Generar otro código
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 mt-2 text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
