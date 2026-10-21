"use client";

import Link from "next/link";
import { useState } from "react";

const cards = [
  {
    title: "Referral Earnings",
    blurb: "Invite friends with your unique link and earn on three levels every time they activate.",
    cta: "Start Referring",
    href: "/register",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    title: "Forex Lessons",
    blurb: "Learn forex trading step by step and open a live account with our partner brokers.",
    cta: "View Lessons",
    href: "#forex-lessons",
    icon: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  },
  {
    title: "Watch & Earn",
    blurb: "Get paid to watch YouTube videos, TikTok clips, movies and reels every day.",
    cta: "How It Works",
    href: "#how-it-works",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </>
    ),
  },
  {
    title: "Ads & Tasks",
    blurb: "View sponsored ads, complete simple tasks and grow your balance on the go.",
    cta: "View Tasks",
    href: "/tasks",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
  },
];

type CardData = (typeof cards)[number];

const buttonClass =
  "rounded-full bg-white px-6 py-2 text-sm font-bold text-brand-500 shadow hover:bg-brand-50";

function FlipCard({ card }: { card: CardData }) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((f) => !f);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className="group h-56 cursor-pointer [perspective:1000px]"
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl border-b-4 border-gold-400 bg-white shadow-lg [backface-visibility:hidden]">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100/40 text-gold-500 ring-1 ring-gold-100">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {card.icon}
            </svg>
          </span>
          <h3 className="text-lg font-extrabold text-brand-900">{card.title}</h3>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 px-6 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <h3 className="text-lg font-extrabold text-brand-900">{card.title}</h3>
          <p className="text-sm font-medium text-brand-900">{card.blurb}</p>
          {card.href.startsWith("/") ? (
            <Link href={card.href} onClick={(e) => e.stopPropagation()} className={buttonClass}>
              {card.cta}
            </Link>
          ) : (
            <a href={card.href} onClick={(e) => e.stopPropagation()} className={buttonClass}>
              {card.cta}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlipCards() {
  return (
    <section id="courses" className="relative z-10 mx-auto -mt-24 max-w-6xl px-4 pb-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <FlipCard key={c.title} card={c} />
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-brand-500">
        Start earning with Flexqash today. Terms and conditions apply.
      </p>
    </section>
  );
}