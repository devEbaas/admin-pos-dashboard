import * as React from "react";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const inputClass =
  "px-2.5 py-2.5 text-[13.5px] rounded-[7px] bg-surface-2 border border-border-strong text-text-primary outline-none focus:border-accent";
const labelClass = "text-[11.5px] font-semibold text-text-secondary";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "cashier", label: "Cajero" },
];

export function AddUserModal({ businessId, onClose, onCreated }) {
  const { call } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("cashier");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = await call(`/admin/businesses/${businessId}/users`, {
        method: "POST",
        body: { name, username: email, email, phone, role },
      });
      setCreated(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Usuario: ${created.username}\nContraseña: ${created.temporaryPassword}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin clipboard disponible — la credencial sigue visible para copiar a mano
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(0.1_0.01_260_/_0.6)]"
      onClick={created ? undefined : onClose}
    >
      {!created && (
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] bg-surface border border-border-strong rounded-2xl p-7 animate-[scaleIn_0.25s_ease]"
        >
          <div className="mb-[18px] text-[17px] font-bold text-text-primary">Agregar usuario</div>

          {error && <div className="mb-3 text-xs text-danger">{error}</div>}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nombre completo</label>
              <input type="text" required autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Correo</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Teléfono móvil</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Rol</label>
              <div className="flex gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex-1 py-2.5 rounded-[7px] text-[12.5px] font-semibold transition-colors border ${
                      role === opt.value
                        ? "bg-accent-soft border-accent text-accent-text"
                        : "bg-surface-2 border-border-strong text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-[22px]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-[13.5px] font-semibold rounded-lg bg-neutral-soft text-text-secondary hover:brightness-125 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover transition-all disabled:opacity-50"
            >
              {saving ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </form>
      )}

      {created && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] bg-surface border border-border-strong rounded-2xl p-7 text-center animate-[scaleIn_0.25s_ease]"
        >
          <div className="mb-1 text-[17px] font-bold text-text-primary">Usuario agregado</div>
          <div className="mb-5 text-[12.5px] text-text-muted">
            Copia estas credenciales — no se volverán a mostrar.
          </div>
          <div className="p-4 mb-4 text-left rounded-lg bg-surface-2">
            <div className="mb-2">
              <div className="text-[11px] text-text-muted">Usuario</div>
              <div className="font-mono text-[13.5px] text-text-primary">{created.username}</div>
            </div>
            <div>
              <div className="text-[11px] text-text-muted">Contraseña</div>
              <div className="font-mono text-[15px] font-bold tracking-wide text-text-primary">
                {created.temporaryPassword}
              </div>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="w-full py-2 mb-2 text-[13px] font-semibold rounded-lg bg-neutral-soft text-text-secondary hover:brightness-125 transition-all"
          >
            {copied ? "Copiado ✓" : "Copiar credenciales"}
          </button>
          <button
            onClick={onCreated}
            className="w-full py-2.5 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover transition-all"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
