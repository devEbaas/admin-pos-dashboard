import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PairingTab } from "./components/PairingTab";
import { UsersTab } from "./components/UsersTab";
import { LicensesTab } from "./components/LicensesTab";

const TABS = [
  { key: "pairing", label: "Pairing codes" },
  { key: "usuarios", label: "Usuarios" },
  { key: "licencias", label: "Licencias" },
];

export default function BusinessDetailView() {
  const { id } = useParams();
  const { call } = useAuth();
  const [business, setBusiness] = useState(null);
  const [devices, setDevices] = useState(null);
  const [pairingCodes, setPairingCodes] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pairing");

  const load = useCallback(async () => {
    try {
      const [businessData, deviceData, pairingCodeData, userData] = await Promise.all([
        call(`/admin/businesses/${id}`),
        call(`/admin/businesses/${id}/devices`),
        call(`/admin/businesses/${id}/devices/pairing-codes`),
        call(`/admin/businesses/${id}/users`),
      ]);
      setBusiness(businessData);
      setDevices(deviceData);
      setPairingCodes(pairingCodeData);
      setUsers(userData);
    } catch (err) {
      setError(err.message);
    }
  }, [call, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !business) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (!business) {
    return <p className="text-sm text-text-muted">Cargando...</p>;
  }

  return (
    <div>
      <Link to="/businesses" className="text-[13px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 mb-4">
        ← Volver a clientes
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <div className="text-2xl font-bold tracking-tight text-text-primary">{business.name}</div>
        <div className="font-mono text-[11px] text-text-muted bg-surface border border-border px-2 py-0.5 rounded-md">
          {business.id.slice(0, 8)}
        </div>
      </div>
      <div className="mb-6 font-mono text-[13px] text-accent-text">/{business.slug}</div>

      {error && <div className="mb-4 text-[13px] text-danger">{error}</div>}

      <div className="flex gap-1.5 mb-6 border-b border-border-soft">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`bg-transparent border-none px-4 py-2.5 text-[13.5px] font-semibold cursor-pointer border-b-2 -mb-px transition-colors ${
              tab === t.key ? "text-text-primary border-accent" : "text-text-muted border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pairing" && (
        <PairingTab business={business} pairingCodes={pairingCodes} onGenerated={load} />
      )}
      {tab === "usuarios" && (
        <UsersTab businessId={id} users={users} onChanged={load} />
      )}
      {tab === "licencias" && (
        <LicensesTab businessId={id} devices={devices} onChanged={load} />
      )}
    </div>
  );
}
