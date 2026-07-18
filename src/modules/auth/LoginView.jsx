import * as React from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginView() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/businesses" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/businesses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full p-6 animate-[fadeIn_0.4s_ease]"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, oklch(0.19 0.02 255), oklch(0.13 0.01 260) 60%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] bg-surface border border-border-strong rounded-2xl px-8 py-9 animate-[scaleIn_0.35s_ease]"
      >
        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 font-mono text-[9px] leading-tight text-center text-text-muted border border-dashed rounded-xl border-border-strong">
          LOGO
        </div>
        <h1 className="text-center text-[22px] font-bold tracking-tight text-text-primary">
          Absolute POS
        </h1>
        <p className="mt-1 mb-7 text-center text-[13px] text-text-muted">
          Panel administrativo
        </p>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Correo</label>
            <input
              type="text"
              required
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@absolutepos.com"
              className="px-3 py-2.5 text-sm rounded-lg bg-surface-2 border border-border-strong text-text-primary outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-3 py-2.5 text-sm rounded-lg bg-surface-2 border border-border-strong text-text-primary outline-none focus:border-accent"
            />
          </div>

          {error && <div className="text-[12.5px] text-danger">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 text-sm font-bold rounded-lg bg-accent text-bg hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
