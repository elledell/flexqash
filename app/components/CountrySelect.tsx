"use client";

import "flag-icons/css/flag-icons.min.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES } from "../../convex/countries";
import { inputClass } from "./ui";

type Props = {
  value: string;
  onChange: (code: string) => void;
};

export default function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...COUNTRIES];
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        c.currency.toLowerCase().includes(q) ||
        c.dial.startsWith(q.replace("+", ""))
    );
  }, [query]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Focus the search box when the list opens
  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setQuery("");
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        id="country"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className="flex items-center gap-3">
          {selected && <span className={`fi fi-${selected.code.toLowerCase()} rounded-sm`} />}
          {selected ? selected.name : "Select country"}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-brand-100 bg-white shadow-xl">
          <div className="relative border-b border-brand-100 p-2">
            <svg className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-brand-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country..."
              className="w-full rounded-md border border-brand-100 py-2 pl-9 pr-3 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-400 focus:outline-none"
            />
          </div>

          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-brand-400">No country found</li>
            )}
            {filtered.map((c) => (
              <li key={c.code} role="option" aria-selected={c.code === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-brand-50 ${
                    c.code === value ? "bg-brand-50 font-bold" : ""
                  }`}
                >
                  <span className={`fi fi-${c.code.toLowerCase()} rounded-sm`} />
                  <span className="flex-1 text-brand-900">{c.name}</span>
                  <span className="text-xs text-brand-400">+{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}