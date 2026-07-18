import * as React from "react";

const VARIANTS = {
  accent: "bg-accent-soft text-accent-text",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-text-secondary",
};

export function Badge({ variant = "neutral", children }) {
  return (
    <span
      className={`inline-block px-2.5 py-[3px] rounded-md text-[11.5px] font-semibold ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
