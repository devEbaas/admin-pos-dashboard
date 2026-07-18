import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsView() {
  const { call } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    call("/platform-admins/me")
      .then((admin) => {
        setName(admin.name || "");
        setEmail(admin.email || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [call]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await call("/platform-admins/me", { method: "PATCH", body: { name, email } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="text-2xl font-bold tracking-tight text-text-primary mb-1.5">Configuración</div>
      <div className="mb-7 text-[13.5px] text-text-muted">Ajustes de la cuenta administradora</div>

      {loading ? (
        <p className="text-sm text-text-muted">Cargando...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-[480px] bg-surface border border-border rounded-2xl p-6 flex flex-col gap-[18px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 font-mono text-[9px] leading-tight text-center text-text-muted border border-dashed rounded-xl border-border-strong">
              LOGO<br />240×80
            </div>
            <div className="text-xs text-text-muted">
              Espacio reservado para el logo de Absolute POS. Se integrará más adelante.
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Nombre del administrador
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg bg-surface-2 border border-border-strong text-text-primary outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg bg-surface-2 border border-border-strong text-text-primary outline-none focus:border-accent"
            />
          </div>

          {error && <div className="text-xs text-danger">{error}</div>}
          {saved && <div className="text-xs text-success">Cambios guardados.</div>}

          <button
            type="submit"
            disabled={saving}
            className="self-start px-5 py-2.5 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
}
