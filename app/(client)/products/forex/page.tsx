"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

export default function ForexPage() {
  const router = useRouter();
  const forexData = useQuery(api.forex.getForexData);
  const joinClass = useMutation(api.forex.joinForexClass);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Track the exact shortfall amount and currency for the top-up card
  const [shortfall, setShortfall] = useState<{ amount: number; currency: string } | null>(null);

  if (forexData === undefined) {
    return <div className="flex min-h-screen items-center justify-center font-bold text-[#112a46]">Loading Forex Data...</div>;
  }

  if (forexData === null) {
    return null;
  }

  const handleJoin = async () => {
    setError("");
    setSuccess("");
    setShortfall(null);
    setLoading(true);

    try {
      const res = await joinClass({ cost: forexData.localizedCost, currency: forexData.currency });
      if (res.success) {
        setSuccess(res.message);
      }
    } catch (err: any) {
      // Catch the custom INSUFFICIENT_FUNDS error from the backend and trigger the redirect card
      if (err.data?.code === "INSUFFICIENT_FUNDS") {
        setShortfall({ amount: err.data.shortfall, currency: err.data.currency });
      } else {
        setError(err.data?.message || err.message || "Failed to process payment.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Forex Masterclass</h1>
        <button onClick={() => router.back()} className="text-sm font-medium text-gray-500 hover:text-[#1abc9c]">
          « Go Back
        </button>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Dynamic Top-Up Redirect Card (Triggers when funds are low) */}
        {shortfall && (
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 shadow-sm md:flex-row animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-2xl">
                💳
              </div>
              <div>
                <h3 className="text-lg font-black text-red-900">Insufficient Funds</h3>
                <p className="text-sm font-medium text-red-700">
                  You are short <strong className="text-red-900 bg-white px-1.5 py-0.5 rounded text-xs">{shortfall.currency} {shortfall.amount.toLocaleString()}</strong> to join the Masterclass.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/deposit?amount=${shortfall.amount}`)}
              className="w-full md:w-auto whitespace-nowrap rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-700 hover:-translate-y-0.5"
            >
              Deposit {shortfall.currency} {shortfall.amount.toLocaleString()} →
            </button>
          </div>
        )}

        {forexData.isMember ? (
          /* VIP MEMBER VIEW */
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-500/10">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                📈
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#112a46]">Welcome to the Inner Circle</h2>
                <span className="mt-1 inline-block rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Lifetime Access Active
                </span>
              </div>
            </div>

            <div className="mb-8 rounded-xl bg-gray-50 p-6 border border-gray-100">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-500">Weekly Live Session</h3>
              <p className="mb-4 text-[#112a46]">
                Join our expert mentor every <strong>Tuesday</strong> for live market analysis, trading strategies, and Q&A.
              </p>
              
              {forexData.meetingLink ? (
                <a 
                  href={forexData.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-[#112a46] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800 shadow-md"
                >
                  🎥 Join Google Meet Now
                </a>
              ) : (
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-sm font-bold text-orange-600">
                  The meeting link for this week has not been posted yet. Check back on Tuesday!
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-5">
                <h4 className="font-bold text-[#112a46]">Beginner Resources</h4>
                <p className="mt-2 text-sm text-gray-500">Review the introductory materials before attending your first live class.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-5">
                <h4 className="font-bold text-[#112a46]">Signal Group</h4>
                <p className="mt-2 text-sm text-gray-500">Ask the admin to add you to the private signals WhatsApp group.</p>
              </div>
            </div>
          </div>
        ) : (
          /* SALES PITCH VIEW */
          <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
            <div className="bg-[#112a46] p-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl">
                🚀
              </div>
              <h2 className="text-3xl font-black mb-3">Master the Markets</h2>
              <p className="text-blue-100 max-w-lg mx-auto">
                Stop guessing and start trading like a professional. Get lifetime access to our exclusive weekly Forex mentorship.
              </p>
            </div>

            <div className="p-8">
              <div className="mb-8 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500">✔️</span>
                  <p className="text-gray-600"><strong>Live Weekly Classes:</strong> Interactive Google Meet sessions every Tuesday.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500">✔️</span>
                  <p className="text-gray-600"><strong>Expert Mentorship:</strong> Learn direct risk management and chart analysis.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500">✔️</span>
                  <p className="text-gray-600"><strong>Lifetime Access:</strong> Pay once, learn forever.</p>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-gray-50 p-6 text-center border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">One-Time Fee</p>
                <h3 className="text-3xl font-black text-[#1abc9c]">
                  {forexData.currency} {forexData.localizedCost.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-400 mt-1">($10 USD Equivalent)</p>
              </div>

              {error && !shortfall && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm font-bold text-red-500 text-center">❌ {error}</div>}
              {success && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm font-bold text-emerald-600 text-center">✅ {success}</div>}

              <button
                onClick={handleJoin}
                disabled={loading || !!shortfall}
                className="w-full rounded-xl bg-[#1abc9c] py-4 text-base font-bold text-white shadow-lg shadow-[#1abc9c]/30 transition hover:bg-[#16a085] disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay ${forexData.currency} ${forexData.localizedCost.toLocaleString()} from Balance`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}