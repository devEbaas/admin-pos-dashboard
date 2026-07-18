/** @type {import('tailwindcss').Config} */
// Tema oscuro fijo (no adaptativo) — tokens tomados del mockup importado de
// claude.ai/design ("Absolute POS Admin.dc.html"). Sin darkMode/variantes
// dark: — toda la app usa esta paleta directo.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "oklch(0.15 0.012 260)",
        sidebar: "oklch(0.13 0.01 260)",
        surface: "oklch(0.20 0.014 260)",
        "surface-2": "oklch(0.16 0.012 260)",
        border: "oklch(0.28 0.018 260)",
        "border-soft": "oklch(0.24 0.015 260)",
        "border-strong": "oklch(0.32 0.02 260)",
        "text-primary": "oklch(0.96 0.005 260)",
        "text-secondary": "oklch(0.65 0.02 260)",
        "text-muted": "oklch(0.55 0.02 260)",
        accent: "oklch(0.72 0.16 250)",
        "accent-hover": "oklch(0.78 0.16 250)",
        "accent-soft": "oklch(0.72 0.16 250 / 0.16)",
        "accent-text": "oklch(0.82 0.14 250)",
        success: "oklch(0.8 0.15 165)",
        "success-soft": "oklch(0.75 0.15 165 / 0.16)",
        danger: "oklch(0.75 0.17 25)",
        "danger-soft": "oklch(0.68 0.19 25 / 0.16)",
        "neutral-soft": "oklch(0.28 0.018 260)",
      },
    },
  },
  plugins: [],
};
