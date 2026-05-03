"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#111118",
          border: "1px solid #2a2a38",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          animation: "fadeIn 0.15s ease",
        }}
      >
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                backgroundColor: danger ? "#ef444418" : "#6d56fa18",
                borderRadius: 10,
                padding: 10,
                display: "flex",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} color={danger ? "#ef4444" : "#6d56fa"} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#f0f0f8",
                  marginBottom: 4,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#8888a8",
                  lineHeight: 1.5,
                }}
              >
                {description}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={onCancel}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 8,
                border: "1px solid #2a2a38",
                backgroundColor: "transparent",
                color: "#8888a8",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: 8,
                border: "none",
                backgroundColor: danger ? "#ef4444" : "#6d56fa",
                color: "white",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                boxShadow: danger
                  ? "0 4px 12px rgba(239,68,68,0.3)"
                  : "0 4px 12px rgba(109,86,250,0.3)",
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
