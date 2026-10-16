"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { ConvexError } from "convex/values";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";

// Simulated Forex/Crypto live market data for the chart
const marketData = [
  { time: "08:00", value: 1020 },
  { time: "10:00", value: 1080 },
  { time: "12:00", value: 1050 },
  { time: "14:00", value: 1150 },
  { time: "16:00", value: 1120 },
  { time: "18:00", value: 1250 },
  { time: "20:00", value: 1380 },
];

export default function InvestmentsPage() {
  const router = useRouter();
  const packages = useQuery(api.investments.getPackages);
  const myInvestments = useQuery(api.investments.getUserInvestments);
  const purchasePackage = useMutation(api.investments.purchasePackage);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shortfall, setShortfall] = useState<{ amount: number; currency: string } | null>(null);

  const handlePurchase = async (packageId: string, packageName: string) => {
    setError("");
    setSuccess("");
    setShortfall(null);
    setLoadingId(packageId);

    try {
      const result = await purchasePackage({ packageId: packageId as any });
      setSuccess(result.message);
    } catch (err) {
      if (err instanceof ConvexError) {
        const data = err.data as any;
        if (data?.code === "INSUFFICIENT_FUNDS") {
          setShortfall({ amount: data.shortfall, currency: data.currency });
        } else {
          setError(typeof data === "string" ? data : data.message || "An error occurred during purchase.");
        }
      } else {
        setError("A network error occurred.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (packages === undefined || myInvestments === undefined) {
    return <div className="flex min-h-[50vh] items-center justify-center font-bold text-[#112a46]">Loading Markets...</div>;
  }

  const activeInvestments = myInvestments.filter(inv => inv.status === "active");

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      
      {/* Header & Market Graph */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-[#112a46] p-6 shadow-lg relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>📈</span> Live Markets
            </h1>
            <p className="text-sm font-medium text-gray-300 mt-1">Invest in high-yield daily return packages.</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">FlexCoin Index</div>
            <div className="text-3xl font-black text-[#1abc9c]">1,380.00 <span className="text-sm">▲ +35.2%</span></div>
          </div>
        </div>
        
        {/* Decorative Background Forex Graph */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-40 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marketData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1abc9c" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1abc9c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
              <Area type="monotone" dataKey="value" stroke="#1abc9c" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Standard Error / Success Messages */}
      {error && !shortfall && (
        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          ✅ {success}
        </div>
      )}

      {/* Dynamic Top-Up Redirect Card */}
      {shortfall && (
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 shadow-sm md:flex-row animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-2xl">
              💳
            </div>
            <div>
              <h3 className="text-lg font-black text-red-900">Insufficient Balance</h3>
              <p className="text-sm font-medium text-red-700">
                You are short <strong className="text-red-900 bg-white px-1.5 py-0.5 rounded text-xs">{shortfall.currency} {shortfall.amount.toLocaleString()}</strong> for this tier.
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

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Available Packages Storefront */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-[#112a46]">Available Tiers</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {packages.map((pkg) => (
              <div key={pkg._id} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#112a46]">{pkg.name}</h3>
                  <span className="rounded bg-[#e0f2f1] px-2 py-1 text-xs font-bold text-[#1abc9c]">
                    {pkg.dailyRoi}% Daily
                  </span>
                </div>
                
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Cost</span>
                    <span className="font-bold text-[#112a46]">{pkg.cost.toLocaleString()} KES</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Daily Return</span>
                    <span className="font-bold text-[#1abc9c]">{(pkg.cost * (pkg.dailyRoi / 100)).toLocaleString()} Coins</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Duration</span>
                    <span className="font-bold text-[#112a46]">{pkg.durationDays} Days</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg._id, pkg.name)}
                  disabled={loadingId === pkg._id}
                  className="w-full rounded-xl bg-[#112a46] py-3 text-sm font-bold text-white shadow transition hover:bg-[#1a3a5e] disabled:opacity-50"
                >
                  {loadingId === pkg._id ? "Processing..." : "Invest Now"}
                </button>
              </div>
            ))}
            
            {packages.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-medium text-gray-500">
                No investment packages are currently available. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* User's Active Investments Portfolio */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#112a46]">Your Portfolio</h2>
            
            {activeInvestments.length === 0 ? (
              <p className="text-sm font-medium text-gray-500 text-center py-6">
                You do not have any active investments yet.
              </p>
            ) : (
              <div className="space-y-4">
                {activeInvestments.map((inv) => {
                  const daysRemaining = Math.ceil((inv.endDate - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={inv._id} className="rounded-xl border border-gray-50 bg-gray-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-bold text-[#112a46]">{inv.packageName}</span>
                        <span className="flex h-2 w-2 rounded-full animate-pulse bg-[#1abc9c]"></span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                        <span>Daily Payout:</span>
                        <span className="font-bold text-[#1abc9c]">+{inv.dailyPayoutAmount} Coins</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Time Remaining:</span>
                        <span className="font-bold">{daysRemaining} days</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}