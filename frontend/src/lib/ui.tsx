import React from "react";

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span>{label}</span>
        <b>{v}</b>
      </div>
      <div style={{ height: 10, background: "#eee", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", background: "#bdbdbd" }} />
      </div>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {children}
    </div>
  );
}

