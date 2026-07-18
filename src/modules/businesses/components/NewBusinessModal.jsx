import * as React from "react";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos tras normalizar (é -> e´ -> e)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const inputClass =
  "px-2.5 py-2.5 text-[13.5px] rounded-[7px] bg-surface-2 border border-border-strong text-text-primary outline-none focus:border-accent";
const labelClass = "text-[11.5px] font-semibold text-text-secondary";

export function NewBusinessModal({ onClose, onCreated }) {
  const { call } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null); // { business, owner }
  const [copied, setCopied] = useState(false);

  const handleNameChange = (value) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = await call("/admin/businesses", {
        method: "POST",
        body: { name, slug, ownerName, ownerEmail, ownerPhone },
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
        `Usuario: ${created.owner.username}\nContraseña: ${created.owner.temporaryPassword}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard puede fallar sin HTTPS/permiso — no es crítico, la
      // credencial sigue visible en pantalla para copiar a mano.
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
          className="w-full max-w-[440px] bg-surface border border-border-strong rounded-2xl p-7 animate-[scaleIn_0.25s_ease]"
        >
          <div className="mb-1 text-[17px] font-bold text-text-primary">Nueva tienda</div>
          <div className="mb-5 text-[12.5px] text-text-muted">
            Se creará junto con el usuario administrador inicial
          </div>

          {error && <div className="mb-3 text-xs text-danger">{error}</div>}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nombre del negocio</label>
              <input
                type="text" required autoFocus value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Café Aurora" className={inputClass}
              />
            </div>
            <div className="flex gap-2.5">
              <div className="flex flex-col flex-1 gap-1.5">
                <label className={labelClass}>Slug</label>
                <input
                  type="text" required value={slug}
                  onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
                  className={`${inputClass} font-mono text-accent-text`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nombre del dueño</label>
              <input
                type="text" required value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Marisol Iglesias" className={inputClass}
              />
            </div>
            <div className="flex gap-2.5">
              <div className="flex flex-col flex-1 gap-1.5">
                <label className={labelClass}>Correo</label>
                <input
                  type="email" required value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col flex-1 gap-1.5">
                <label className={labelClass}>Teléfono móvil</label>
                <input
                  type="tel" required value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-[22px]">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 text-[13.5px] font-semibold rounded-lg bg-neutral-soft text-text-secondary hover:brightness-125 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover transition-all disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear tienda"}
            </button>
          </div>
        </form>
      )}

      {created && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] bg-surface border border-border-strong rounded-2xl p-7 text-center animate-[scaleIn_0.25s_ease]"
        >
          <div className="mb-1 text-[17px] font-bold text-text-primary">
            {created.business.name} creada
          </div>
          <div className="mb-5 text-[12.5px] text-text-muted">
            Copia estas credenciales — no se volverán a mostrar.
          </div>
          <div className="p-4 mb-4 text-left rounded-lg bg-surface-2">
            <div className="mb-2">
              <div className="text-[11px] text-text-muted">Usuario</div>
              <div className="font-mono text-[13.5px] text-text-primary">{created.owner.username}</div>
            </div>
            <div>
              <div className="text-[11px] text-text-muted">Contraseña</div>
              <div className="font-mono text-[15px] font-bold tracking-wide text-text-primary">
                {created.owner.temporaryPassword}
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
            onClick={() => onCreated(created.business)}
            className="w-full py-2.5 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover transition-all"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
