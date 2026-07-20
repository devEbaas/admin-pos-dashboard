import * as React from "react";
import { useState } from "react";
import { Badge } from "../../../components/Badge";
import { AddUserModal } from "./AddUserModal";

export function UsersTab({ businessId, users, onChanged }) {
  const [showModal, setShowModal] = useState(false);

  const handleCreated = () => {
    setShowModal(false);
    onChanged?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] text-text-muted">Usuarios con acceso a esta tienda</div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-[13px] font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover transition-colors"
        >
          + Agregar usuario
        </button>
      </div>

      <div className="overflow-hidden border rounded-2xl bg-surface border-border">
        {(!users || users.length === 0) ? (
          <div className="p-8 text-center text-[13px] text-text-muted">
            Sin usuarios todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-soft">
                  {["Nombre", "Contacto", "Rol", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11.5px] font-semibold tracking-wider text-left uppercase text-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border-soft last:border-0">
                    <td className="px-5 py-3.5 text-[13.5px] font-semibold text-text-primary whitespace-nowrap">{u.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-[12.5px] text-text-secondary whitespace-nowrap">{u.email || u.username}</div>
                      {u.phone && <div className="text-[11.5px] text-text-muted whitespace-nowrap">{u.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.role === "admin" ? "accent" : "neutral"}>
                        {u.role === "admin" ? "Admin" : "Cajero"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.active ? "success" : "neutral"}>
                        {u.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddUserModal businessId={businessId} onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
