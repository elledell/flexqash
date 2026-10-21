"use client";

import { useEffect, useState } from "react";

// TODO: replace with your real contact details
const CONTACT = {
  email: "support@flexqash.com",
  phone: "+254 182 852 787",
};

const headlines = [
  "Turn Your Phone Into a Money-Making Machine",
  "Refer Friends & Earn Cash",
  "Watch Videos, Ads & Complete Tasks",
];

function TypingText({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState(phrases[0]);
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Respect "reduce motion": keep the first headline static
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const full = phrases[index];
    let delay = deleting ? 35 : 80;

    if (!deleting && text === full) delay = 1800;
    if (deleting && text === "") delay = 400;

    const t = setTimeout(() => {
      if (!deleting && text === full) {
        setDeleting(true);
      } else if (deleting && text === "") {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      } else {
        setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
      }
    }, delay);

    return () => clearTimeout(t);
  }, [text, deleting, index, phrases]);

  return (
    <>
      {text}
      <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse bg-gold-300" />
    </>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-500 to-brand-400 px-4 pb-32 pt-10 text-center sm:pt-12">
      {/* subtle chart-line decoration */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <path d="M0 330 L80 290 L150 310 L240 220 L320 250 L420 150 L500 190 L600 90 L700 120 L800 40" />
        <path d="M0 380 L100 350 L200 365 L300 300 L400 320 L520 240 L640 270 L800 180" />
      </svg>

      <div className="relative mx-auto max-w-4xl">
        <h1 className="flex min-h-[2.6em] items-center justify-center text-3xl font-extrabold leading-tight text-white drop-shadow sm:min-h-[1.3em] sm:text-5xl">
          <span>
            <TypingText phrases={headlines} />
          </span>
        </h1>
        
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-white/90 sm:text-base">
          FLEXQASH gives you multiple ways to earn money online — refer friends, watch videos, answer trivia, write articles and spin to win. Withdraw instantly to M-Pesa, Airtel Money, MTN and more.
        </p>

        {/* Contact pill */}
        <div className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-full bg-brand-900/80 px-6 py-3 text-xs text-white backdrop-blur sm:text-sm">
          <span>
            <span className="font-bold text-gold-300">Email:</span> {CONTACT.email}
          </span>
          <span className="hidden text-brand-300 sm:inline">|</span>
          <span>
            <span className="font-bold text-gold-300">Call:</span> {CONTACT.phone}
          </span>
        </div>
      </div>
    </section>
  );
}