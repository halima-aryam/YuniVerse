"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const themes = [
  { id: "minimal", label: "Minimal" },
  { id: "dark-academia", label: "Dark Academia" },
  { id: "cottagecore", label: "Cottagecore" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 16px",
          borderRadius: "20px",
          border: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          fontSize: "0.9rem",
          cursor: "pointer",
          outline: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--font-sans), sans-serif",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease"
        }}
      >
        <span style={{ color: "var(--accent)" }}>✦</span> {currentTheme.label}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "8px",
          minWidth: "160px",
          boxShadow: "var(--shadow-md)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id as any);
                setIsOpen(false);
              }}
              style={{
                background: theme === t.id ? "var(--bg-secondary)" : "transparent",
                color: theme === t.id ? "var(--accent)" : "var(--text-primary)",
                border: "none",
                padding: "8px 12px",
                borderRadius: "8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontFamily: "var(--font-sans), sans-serif",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (theme !== t.id) e.currentTarget.style.background = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                if (theme !== t.id) e.currentTarget.style.background = "transparent";
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
