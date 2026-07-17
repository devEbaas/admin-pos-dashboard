import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NewBusinessModal } from "./components/NewBusinessModal";

export default function BusinessesListView() {
  const { call } = useAuth();
  const [businesses, setBusinesses] = useState(null);
  const [error, setError] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const load = useCallback(async () => {
    try {
      setBusinesses(await call("/admin/businesses"));
    } catch (err) {
      setError(err.message);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreated = (business) => {
    setShowNewModal(false);
    setBusinesses((prev) => (prev ? [business, ...prev] : [business]));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Negocios</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + Nuevo negocio
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {businesses === null && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      )}

      {businesses?.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todavía no hay negocios registrados.
        </p>
      )}

      {businesses?.length > 0 && (
        <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-gray-200 dark:border-gray-700">
              <tr className="text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/businesses/${b.id}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                    {b.slug}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNewModal && (
        <NewBusinessModal onClose={() => setShowNewModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
