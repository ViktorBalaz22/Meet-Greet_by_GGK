"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeId, THEMES } from "@/lib/themes";
import Image from "next/image";

export default function ThemeSwitcher() {
  const { themeId, setThemeId, themeIds } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white/95 shadow-sm hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Zmeniť corporate design"
      >
        <span className="text-sm font-medium text-gray-700">Design</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute top-full right-0 mt-1 w-48 py-1 rounded-lg border border-gray-200 bg-white shadow-lg"
          role="menu"
        >
          {themeIds.map((id) => {
            const t = THEMES[id as ThemeId];
            const isActive = id === themeId;
            return (
              <li key={id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setThemeId(id as ThemeId);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="relative w-8 h-8 rounded flex items-center justify-center overflow-hidden bg-gray-100">
                    <Image
                      src={t.logo}
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain w-6 h-6"
                      unoptimized={t.logo.endsWith(".svg")}
                    />
                  </span>
                  <span>{t.name}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4 ml-auto text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
