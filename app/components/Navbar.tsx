"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#courses", label: "Courses" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#countries", label: "Countries" },
  { href: "#forex-lessons", label: "Forex Lessons" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="text-2xl font-extrabold text-brand-500">
            Flex<span className="text-gold-500">Qash</span>
          </span>
          <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-brand-900">
            FOREX LESSONS
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-bold text-brand-500 transition-colors hover:text-gold-600"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/sign-in"
            className="rounded-md border-2 border-brand-500 px-5 py-2 text-sm font-bold text-brand-500 transition-colors hover:bg-brand-50"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-gold-400 px-5 py-2 text-sm font-bold text-brand-900 shadow transition-colors hover:bg-gold-500"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-brand-500 hover:bg-brand-50 lg:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-brand-100 bg-white px-4 pb-5 lg:hidden">
          <ul className="flex flex-col py-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-bold text-brand-500"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-3">
            <Link
              href="/sign-in"
              className="flex-1 rounded-md border-2 border-brand-500 py-2 text-center text-sm font-bold text-brand-500"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="flex-1 rounded-md bg-gold-400 py-2 text-center text-sm font-bold text-brand-900"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}