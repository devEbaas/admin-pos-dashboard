import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PairingCodeModal } from "./components/PairingCodeModal";

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

function pairingCodeStatus(code) {
  if (code.usedAt) return { label: "Usado", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" };
  if (new Date(code.expiresAt) < new Date()) {
    return { label: "Expirado", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
  }
  return { label: "Activo", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" };
}

const PLATFORM_ICON = { desktop: "🖥️", mobile: "📱" };

export default function BusinessDetailView() {
  const { id } = useParams();
  const { call } = useAuth();
  const [business, setBusiness] = useState(null);
  const [devices, setDevices] = useState(null);
  const [pairingCodes, setPairingCodes] = useState(null);
  const [error, setError] = useState("");
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [businessData, deviceData, pairingCodeData] = await Promise.all([
        call(`/admin/businesses/${id}`),
        call(`/admin/businesses/${id}/devices`),
        call(`/admin/businesses/${id}/devices/pairing-codes`),
      ]);
      setBusiness(businessData);
      setDevices(deviceData);
      setPairingCodes(pairingCodeData);
    } catch (err) {
      setError(err.message);
    }
  }, [call, id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (device) => {
    if (!window.confirm(`¿Revocar "${device.label}"? Dejará de sincronizar de inmediato.`)) {
      return;
    }
    setRevokingId(device.id);
    try {
      await call(`/admin/businesses/${id}/devices/${device.id}/revoke`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRevokingId(null);
    }
  };

  const handlePairingClosed = () => {
    setShowPairingModal(false);
    load();
  };

  if (error && !business) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!business) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>;
  }

  return (
    <div>
      <Link to="/businesses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Negocios
      </Link>

      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{business.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{business.slug}</p>
        </div>
        <button
          onClick={() => setShowPairingModal(true)}
          className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + Emparejar dispositivo
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Dispositivos
        </h2>
        <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-gray-200 dark:border-gray-700">
              <tr className="text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Dispositivo</th>
                <th className="px-4 py-3 font-medium">Última actividad</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {devices?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                    Sin dispositivos emparejados todavía.
                  </td>
                </tr>
              )}
              {devices?.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    <span className="mr-1">{PLATFORM_ICON[d.platform] ?? "🖥️"}</span>
                    {d.label}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {relativeTime(d.lastSeenAt)}
                  </td>
                  <td className="px-4 py-3">
                    {d.revokedAt ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Revocado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Activo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!d.revokedAt && (
                      <button
                        onClick={() => handleRevoke(d)}
                        disabled={revokingId === d.id}
                        className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
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
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Historial de pairing codes
        </h2>
        <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-gray-200 dark:border-gray-700">
              <tr className="text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Generado</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {pairingCodes?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                    Todavía no se ha generado ningún código.
                  </td>
                </tr>
              )}
              {pairingCodes?.map((code) => {
                const status = pairingCodeStatus(code);
                return (
                  <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{code.code}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {PLATFORM_ICON[code.platform] ?? "🖥️"} {code.platform}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {relativeTime(code.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {showPairingModal && (
        <PairingCodeModal business={business} onClose={handlePairingClosed} />
      )}
    </div>
  );
}
