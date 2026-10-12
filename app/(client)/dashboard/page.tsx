"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();
  
  const me = useQuery(api.users.me);
  const stats = useQuery(api.dashboard.getStats);
  const membershipStatus = useQuery(api.membership.status);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    } else if (me && membershipStatus && me.role !== "admin" && !membershipStatus.active) {
      router.replace("/membership");
    }
  }, [isLoading, isAuthenticated, me, membershipStatus, router]);

  if (!me || stats === undefined || membershipStatus === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-[#112a46] font-medium">Loading dashboard...</div>;
  }

  // Safely check if membershipStatus exists before reading .active
  if (!membershipStatus?.active) return null;

  if (stats === null) {
    return <div className="p-8 text-center text-red-500 font-bold">Error loading dashboard data.</div>;
  }

  // Construct referral link based on domain and username safely
  const baseURL = typeof window !== "undefined" ? window.location.origin : "https://flexqash.com";
  const referralLink = `${baseURL}/sign-up?ref=${me.username || (me.name ? me.name.replace(/\s+/g, '') : 'user')}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Home</h1>
        <div className="text-sm font-medium text-gray-500">
          Dashboard » <span className="text-[#1abc9c]">Home</span>
        </div>
      </div>

     {/* Main Total Earnings Card - Luminous Green Gradient */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#00c853] via-[#10b981] to-[#059669] p-6 text-white shadow-xl shadow-emerald-500/20 sm:p-8">
        <div className="mb-3 flex items-center gap-2 text-base font-extrabold tracking-wide">
          <span>📍 Hello, {stats.username}</span>
          <span>👋</span>
        </div>
        <p className="mb-8 max-w-2xl text-sm font-bold leading-relaxed text-white/95">
          Welcome to FLEXQASH 🚀 Earn daily — courses, videos, games, trivia & referrals. Withdraw to mobile money!
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Total Earnings</p>
            <h2 className="mt-1 text-4xl font-black tracking-tight drop-shadow-sm">
              {stats.currency} {stats.totalEarnings.toLocaleString()}
            </h2>
          </div>
          <div className="rounded-xl border border-white/30 bg-black/15 px-6 py-4 text-right backdrop-blur-md">
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Expense</p>
            <p className="text-2xl font-black">{stats.currency} {stats.expense.toLocaleString()}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">one-time</p>
          </div>
        </div>
      </div>

      {/* 4-Grid Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Balance - Changed to BLUE */}
        <div className="rounded-2xl bg-[#3498db] p-6 text-white shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider opacity-90">Balance</p>
          <h3 className="mt-2 text-2xl font-extrabold">{stats.currency} {stats.balance.toLocaleString()}</h3>
          <p className="mt-4 text-xs uppercase tracking-widest opacity-80">All Time</p>
        </div>
        
        {/* Withdrawn - Changed to YELLOW */}
        <div className="rounded-2xl bg-[#f1c40f] p-6 text-white shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider opacity-90">Withdrawn</p>
          <h3 className="mt-2 text-2xl font-extrabold">{stats.currency} {stats.withdrawn.toLocaleString()}</h3>
          <p className="mt-4 text-xs uppercase tracking-widest opacity-80">All Time</p>
        </div>
        
       {/* Affiliate Earnings - Changed to PURPLE */}
        <div className="rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] p-6 text-white shadow-md shadow-purple-500/20">
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">Affiliate Earnings</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{stats.currency} {stats.affiliateEarnings.toLocaleString()}</h3>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest opacity-80">All Time</p>
        </div>
        
        {/* Agent Bonus - Changed to GRAY */}
        <div className="rounded-2xl bg-[#7f8c8d] p-6 text-white shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider opacity-90">Agent Bonus</p>
          <h3 className="mt-2 text-2xl font-extrabold">{stats.currency} {stats.agentBonus.toLocaleString()}</h3>
          <p className="mt-4 text-xs uppercase tracking-widest opacity-80">All Time</p>
        </div>
      </div>

      {/* Analytics & Referral Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Referral Chart Placeholder */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">REFERRALS — LAST 7 DAYS</h3>
            <span className="rounded-full bg-[#e0f2f1] px-3 py-1 text-xs font-bold text-[#1abc9c]">👥 0 all time</span>
          </div>
          <div className="flex h-48 items-center justify-center border-b border-dashed border-gray-200">
            <p className="text-sm text-gray-400">Graph data will appear here</p>
          </div>
          <div className="mt-4 flex gap-3">
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-[#8e2de2]">⚡ Today: 0</span>
            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">📅 This week: 0</span>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">🏆 See leaderboard</span>
          </div>
        </div>

        {/* Earnings Mix Placeholder */}
        <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">EARNINGS MIX</h3>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-[#1abc9c]">
              <span className="text-sm font-bold text-[#112a46]">
                {stats.currency} {stats.totalEarnings >= 1000 ? (stats.totalEarnings/1000).toFixed(1) + 'k' : stats.totalEarnings}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#1abc9c]"></span> Referrals</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Ads</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> YouTube</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Link Tool */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">INVITE LINK</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-600">Your unique referral link</label>
            <div className="flex items-center gap-0">
              <input 
                type="text" 
                readOnly 
                value={referralLink}
                className="flex-1 rounded-l-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
              />
              <button 
                onClick={copyLink}
                className={`rounded-r-lg border border-transparent px-6 py-3 text-sm font-bold text-white transition-colors ${copied ? 'bg-green-500' : 'bg-[#1abc9c] hover:bg-[#16a085]'}`}
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Bonus Goal */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">AGENT BONUS GOAL</h3>
          <span className="rounded-full bg-[#e0f2f1] px-3 py-1 text-xs font-bold text-[#1abc9c]">0 / 6</span>
        </div>
        <p className="mb-3 text-sm text-gray-600">Invite 6 active users to claim your bonus.</p>
        <div className="h-2.5 w-full rounded-full bg-gray-100">
          <div className="h-2.5 rounded-full bg-[#8e2de2]" style={{ width: '0%' }}></div>
        </div>
      </div>

    </div>
  );
}