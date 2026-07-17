const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Wrapper de fetch con manejo de error uniforme — mismo espíritu que
// cloudRequest en absolute-pos-app/src/main/sync/client.js: sin librería de
// data-fetching, solo un helper delgado reutilizado por todo el dashboard.
export async function apiFetch(path, { method = "GET", body, token } = {}) {
  if (!API_URL) {
    throw new ApiError("VITE_API_URL no está configurado", 0);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || data?.error || `Error ${res.status}`;
    throw new ApiError(message, res.status);
  }
  return data;
}
