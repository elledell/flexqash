"use client";

import Link from "next/link";

export default function ForexLessons() {
  return (
    <section id="forex-lessons" className="relative bg-brand-900 py-16 px-4 text-center sm:py-24">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" viewBox="0 0 800 400" preserveAspectRatio="none" fill="none" stroke="white" strokeWidth="2">
          <path d="M0 330 L80 290 L150 310 L240 220 L320 250 L420 150 L500 190 L600 90 L700 120 L800 40" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-3xl z-10">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Master Forex Trading
        </h2>
        <p className="mt-5 text-base font-medium text-brand-100 sm:text-lg">
          Unlock our comprehensive, step-by-step forex lessons designed specifically for beginners. 
          Learn the basics, master risk management, and practice safely before you trade. 
          Sign up to start learning, or log in to pick up right where you left off.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/register"
            className="w-full rounded-md bg-gold-400 px-8 py-3.5 text-base font-bold text-brand-900 shadow transition-colors hover:bg-gold-500 sm:w-auto"
          >
            Create Free Account
          </Link>
          <Link
            href="/sign-in"
            className="w-full rounded-md border-2 border-brand-300 bg-transparent px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-800 sm:w-auto"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    </section>
  );
}