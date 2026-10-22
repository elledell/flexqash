"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const SERVICE_CONFIG: Record<string, { dbKey: string; title: string; icon: string; color: string }> = {
  chat: { dbKey: "chat", title: "Chat with Foreigners", icon: "💬", color: "bg-emerald-500" },
  ads: { dbKey: "ads", title: "Ads Earnings", icon: "📺", color: "bg-blue-400" },
  tiktok: { dbKey: "tiktok", title: "TikTok Videos", icon: "🎵", color: "bg-orange-400" },
  youtube: { dbKey: "youtube", title: "YouTube Videos", icon: "▶️", color: "bg-red-500" },
  survey: { dbKey: "survey", title: "Surveys", icon: "📋", color: "bg-teal-500" },
  blog: { dbKey: "blog", title: "Blog Reading", icon: "✍️", color: "bg-pink-400" },
  "hotel-reviews": { dbKey: "hotel_review", title: "Hotel Reviews", icon: "🏨", color: "bg-indigo-500" },
};

export default function ServiceWithdrawalPage() {
  const params = useParams();
  const router = useRouter();
  const serviceSlug = params.service as string;
  
  const config = SERVICE_CONFIG[serviceSlug];

  const stats = useQuery(api.dashboard.getStats);
  const requestWithdrawal = useMutation(api.serviceWithdrawals.requestServiceWithdrawal);

  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!config) {
    return <div className="p-8 text-center text-red-500 font-bold">Service not found.</div>;
  }

  if (stats === undefined) {
    return <div className="p-8 text-[#112a46] font-bold">Loading balance...</div>;
  }

  if (stats === null) {
    return <div className="p-8 text-red-500 font-bold">Error loading user stats.</div>;
  }

  const availableBalance = stats.serviceBalances ? (stats.serviceBalances as any)[config.dbKey] || 0 : 0;
  const currency = stats.currency;
  
  // NEW: Safely pull the exact minimum calculated by the backend
  const minWithdrawal = stats.serviceMinWithdrawal || 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }
    if (!phone) {
      setError("Please enter your mobile number.");
      setLoading(false);
      return;
    }

    try {
      const res = await requestWithdrawal({
        serviceKey: config.dbKey,
        amount: numAmount,
        phone,
      });
      if (res.success) {
        setSuccess(res.message);
        setAmount("");
      }
    } catch (err: any) {
      setError(err.data || err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Withdraw From {config.title}</h1>
        <button onClick={() => router.back()} className="text-sm font-medium text-gray-500 hover:text-[#1abc9c]">
          « Go Back
        </button>
      </div>

      <div className="mx-auto max-w-xl">
        {/* Service Header Card */}
        <div className={`mb-8 flex items-center gap-4 rounded-2xl p-6 text-white shadow-md ${config.color}`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            {config.icon}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-90">{config.title} EARNINGS</p>
            <h2 className="text-3xl font-black">{currency} {availableBalance.toLocaleString()}</h2>
            <p className="mt-1 text-[10px] uppercase tracking-widest opacity-80">Available to withdraw</p>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="mb-4 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">REQUEST WITHDRAWAL</h3>
          
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            Withdraw the money you earned from <strong>{config.title}</strong> straight to your mobile number. 
            Minimum withdrawal is <strong>{minWithdrawal.toLocaleString()} {currency}</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-gray-400">
                Amount ({currency})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={currency === "KES" ? "e.g. 5000" : `Enter amount in ${currency}`}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#112a46] outline-none transition focus:border-[#1abc9c]"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-gray-400">
                Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 254700000000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#112a46] outline-none transition focus:border-[#1abc9c]"
              />
            </div>

            {error && <p className="text-sm font-bold text-red-500">{error}</p>}
            {success && <p className="text-sm font-bold text-emerald-500">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#1abc9c] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:opacity-50"
            >
              {loading ? "Processing..." : "Request Withdrawal"}
            </button>
            <p className="mt-4 text-center text-xs font-bold text-gray-400">
              Keep interacting with {config.title} to earn more!
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}