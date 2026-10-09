"use client";

const steps = [
  {
    id: 1,
    title: "Create Your Account",
    description: "Register free in under a minute with just your phone number and email address.",
  },
  {
    id: 2,
    title: "Activate & Explore",
    description: "Pay a small one-time activation fee via mobile money and unlock every earning feature.",
  },
  {
    id: 3,
    title: "Earn & Withdraw",
    description: "Do the activities you enjoy and withdraw your earnings straight to mobile money.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
      <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
        How It Works
      </h2>
      <p className="mt-3 text-base font-medium text-brand-500">
        You are three simple steps away from your first withdrawal.
      </p>

      <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white shadow-md">
              {step.id}
            </div>
            <h3 className="mt-6 text-lg font-bold text-brand-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm font-medium text-brand-500">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}