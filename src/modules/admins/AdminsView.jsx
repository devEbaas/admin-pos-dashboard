import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full px-3 py-2.5 text-sm rounded-lg bg-surface-2 border border-border-strong text-text-primary outline-none focus:border-accent";
const labelClass = "block mb-1 text-xs font-semibold text-text-secondary";

export default function AdminsView() {
  const { call } = useAuth();
  const [admins, setAdmins] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setAdmins(await call("/platform-admins"));
    } catch (err) {
      setError(err.message);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await call("/platform-admins", { method: "POST", body: form });
      setForm({ name: "", username: "", email: "", password: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="text-2xl font-bold tracking-tight text-text-primary mb-1.5">Administradores</div>
      <div className="mb-7 text-[13.5px] text-text-muted">
        Operadores con acceso a pos-root-dashboard
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {error && <div className="mb-3 text-xs text-danger">{error}</div>}

          <div className="overflow-hidden border rounded-2xl bg-surface border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-soft">
                  {["Nombre", "Usuario", "Correo"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11.5px] font-semibold tracking-wider text-left uppercase text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins?.map((a) => (
                  <tr key={a.id} className="border-b border-border-soft last:border-0">
                    <td className="px-5 py-3.5 text-text-primary">{a.name}</td>
                    <td className="px-5 py-3.5 font-mono text-[13px] text-text-secondary">{a.username}</td>
                    <td className="px-5 py-3.5 text-[13px] text-text-muted">{a.email || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3 text-[13px] font-bold text-text-secondary">Agregar administrador</div>
          <form
            onSubmit={handleSubmit}
            className="p-5 bg-surface border border-border rounded-2xl flex flex-col gap-3"
          >
            <div>
              <label className={labelClass}>Nombre</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Usuario</label>
              <input
                type="text" required value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Correo (opcional)</label>
              <input
                type="email" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contraseña</label>
              <input
                type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 mt-1 text-[13.5px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover transition-all disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
