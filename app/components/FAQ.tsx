"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How do I start earning on FLEXQASH?",
    answer:
      "Create a free account, activate it with a one-time fee for your country, and instantly unlock referrals, video watching, trivia, articles, spins and every other earning feature.",
  },
  {
    question: "How do withdrawals work?",
    answer:
      "Withdrawals are paid straight to your mobile money account — M-Pesa in Kenya, Airtel Money, MTN Mobile Money, Tigo Pesa and other local methods depending on your country.",
  },
  {
    question: "How much can I earn from referrals?",
    answer:
      "You earn on three referral levels. Direct referrals pay the most, and you also earn from the people your referrals invite. Top referrers appear on the weekly country leaderboard.",
  },
  {
    question: "Is there a FLEXQASH mobile app?",
    answer:
      "Yes — download the Android app straight from this website using the DOWNLOAD button, and manage your earnings on the go.",
  },
  {
    question: "Which countries are supported?",
    answer:
      "Kenya, Uganda, Tanzania, Rwanda, Burundi, Malawi, Cameroon, Nigeria, Ghana, DR Congo, Mozambique, Botswana, South Sudan, Zambia, Zimbabwe, South Africa and more are joining regularly.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative bg-brand-50 py-16 px-4 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base font-medium text-brand-500">
          Everything you need to know before you start earning with FLEXQASH.
        </p>

        <div className="mt-10 text-left">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="mb-4 overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-brand-900 sm:text-lg">
                    {faq.question}
                  </span>
                  <span className="ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center text-xl font-bold text-[#1abc9c]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm font-medium leading-relaxed text-brand-500 sm:text-base">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}