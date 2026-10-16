"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function ClaimBonusPage() {
  const bonusStats = useQuery(api.bonus.getStatus);
  const claimBonus = useMutation(api.bonus.claimAgentBonus);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleClaim = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await claimBonus();
      setSuccess(`Bonus Claimed! ${result.currency} ${result.amount.toLocaleString()} has been added to your balance.`);
    } catch (err) {
      setError(err instanceof ConvexError ? String(err.data) : "An error occurred while claiming.");
    } finally {
      setLoading(false);
    }
  };

 if (!bonusStats) {
    return <div className="flex min-h-[50vh] items-center justify-center font-bold text-[#112a46]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Agent Bonus</h1>
        <div className="text-sm font-medium text-gray-500">
          Main » <span className="text-[#1abc9c]">Claim Bonus</span>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gray-100 bg-white p-6 shadow-md sm:p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
          🎁
        </div>
        <h2 className="text-2xl font-black text-[#112a46]">Claim Your Agent Bonus</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          For every 30 active referrals you bring to the platform, you unlock an instant cash bonus added directly to your withdrawable balance.
        </p>

        <div className="my-10 flex flex-col items-center justify-center">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[16px] border-gray-100">
            {/* SVG Progress Ring */}
            <svg className="absolute top-0 left-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#1abc9c"
                strokeWidth="16"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * bonusStats.progressPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-[#112a46]">
                {bonusStats.currentProgress} <span className="text-lg text-gray-400">/ {bonusStats.target}</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Active</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 border border-emerald-100">
            ✅ {success}
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={!bonusStats.canClaim || loading}
          className="w-full rounded-xl bg-[#1abc9c] px-6 py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? "Processing..." : bonusStats.canClaim ? "Claim Cash Bonus Now" : `Need ${bonusStats.target - bonusStats.currentProgress} more active users`}
        </button>

        <div className="mt-8">
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 transition hover:text-[#1abc9c] hover:underline">
            Go Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}