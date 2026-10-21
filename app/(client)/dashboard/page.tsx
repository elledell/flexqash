"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Eye, EyeOff, Wallet, ArrowDownToLine, Users, Gift, CreditCard } from "lucide-react"; 
import Link from "next/link";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();
  
  const me = useQuery(api.users.me);
  const stats = useQuery(api.dashboard.getStats);
  const membershipStatus = useQuery(api.membership.status);
  const bonusStats = useQuery(api.bonus.getStatus);

  const [copied, setCopied] = useState(false);
  const [showBalances, setShowBalances] = useState(true);

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

  if (!membershipStatus?.active) return null;

  if (stats === null) {
    return <div className="p-8 text-center text-red-500 font-bold">Error loading dashboard data.</div>;
  }

  const baseURL = typeof window !== "undefined" ? window.location.origin : "https://flexqash.com";
  const referralLink = `${baseURL}/register?ref=${me.username || (me.name ? me.name.replace(/\s+/g, '') : 'user')}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskMoney = (amount: number) => {
    return showBalances ? amount.toLocaleString() : "****";
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Home</h1>
        <div className="text-sm font-medium text-gray-500">
          Dashboard » <span className="text-[#1abc9c]">Home</span>
        </div>
      </div>

      {/* Main Total Earnings Card */}
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
            <div className="flex items-center gap-3">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Total Earnings</p>
              <button 
                onClick={() => setShowBalances(!showBalances)}
                className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <h2 className="mt-1 text-4xl font-black tracking-tight drop-shadow-sm">
              {stats.currency} {maskMoney(stats.totalEarnings)}
            </h2>
          </div>
          
          {/* UPDATED EXPENSE CARD WITH ICON */}
          <div className="flex items-center justify-between gap-6 rounded-xl border border-white/30 bg-black/15 px-6 py-4 backdrop-blur-md">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Expense</p>
              <p className="text-2xl font-black">{stats.currency} {maskMoney(stats.expense)}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">one-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Grid Metrics with Left-Aligned Icons */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl bg-[#3498db] p-5 text-white shadow-md transition-transform hover:scale-[1.02]">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Balance</p>
            <h3 className="mt-0.5 text-xl font-extrabold">{stats.currency} {maskMoney(stats.balance)}</h3>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest opacity-80">All Time</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 rounded-2xl bg-[#f1c40f] p-5 text-white shadow-md transition-transform hover:scale-[1.02]">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <ArrowDownToLine className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Withdrawn</p>
            <h3 className="mt-0.5 text-xl font-extrabold">{stats.currency} {maskMoney(stats.withdrawn)}</h3>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest opacity-80">All Time</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] p-5 text-white shadow-md shadow-purple-500/20 transition-transform hover:scale-[1.02]">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Affiliates</p>
            <h3 className="mt-0.5 text-xl font-black tracking-tight">{stats.currency} {maskMoney(stats.affiliateEarnings)}</h3>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest opacity-80">All Time</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 rounded-2xl bg-[#7f8c8d] p-5 text-white shadow-md transition-transform hover:scale-[1.02]">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Agent Bonus</p>
            <h3 className="mt-0.5 text-xl font-extrabold">{stats.currency} {maskMoney(stats.agentBonus)}</h3>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest opacity-80">All Time</p>
          </div>
        </div>
      </div>

      {/* Analytics & Referral Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">REFERRALS — LAST 7 DAYS</h3>
            <span className="rounded-full bg-[#e0f2f1] px-3 py-1 text-xs font-bold text-[#1abc9c]">
              👥 {stats.referralStats?.allTime || 0} all time
            </span>
          </div>
          
          <div className="flex h-48 w-full items-center justify-center">
            {stats.referralStats?.chartData && stats.referralStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.referralStats.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1abc9c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1abc9c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#1abc9c', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="referrals" 
                    stroke="#1abc9c" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorReferrals)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">Loading graph data...</p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-[#8e2de2]">
              ⚡ Today: {stats.referralStats?.today || 0}
            </span>
            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">
              📅 This week: {stats.referralStats?.thisWeek || 0}
            </span>
            <span className="cursor-pointer rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors">
              🏆 See leaderboard
            </span>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">EARNINGS MIX</h3>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-[#1abc9c]">
              <span className="text-sm font-bold text-[#112a46]">
                {stats.currency} {stats.totalEarnings >= 1000 ? maskMoney(parseFloat((stats.totalEarnings/1000).toFixed(1))) + (showBalances ? 'k' : '') : maskMoney(stats.totalEarnings)}
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
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">AGENT BONUS GOAL</h3>
          <span className="rounded-full bg-[#e0f2f1] px-3 py-1 text-xs font-bold text-[#1abc9c]">
            {bonusStats ? `${bonusStats.currentProgress} / ${bonusStats.target}` : "0 / 30"}
          </span>
        </div>
        <p className="mb-3 text-sm text-gray-600">Invite 30 active users to claim your bonus.</p>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div 
            className="h-2.5 rounded-full bg-[#8e2de2] transition-all duration-1000 ease-out" 
            style={{ width: `${bonusStats?.progressPercentage || 0}%` }}
          ></div>
        </div>
      </div>

      {/* NEW TIMETABLE SECTION */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-50 p-6">
          <h3 className="flex items-center gap-3 text-lg font-black text-[#112a46] tracking-wide uppercase">
            <span className="text-xl">📅</span> Timetable
          </h3>
          <span className="flex items-center gap-1.5 rounded-full bg-[#1abc9c]/10 px-3 py-1.5 text-xs font-bold text-[#1abc9c] uppercase tracking-wider">
            <span>🕒</span> Weekly
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#112a46] text-white">
              <tr>
                <th className="px-6 py-4 font-black w-16 text-center tracking-wider">#</th>
                <th className="px-6 py-4 font-black tracking-wider uppercase">Name</th>
                <th className="px-6 py-4 font-black tracking-wider uppercase">Day 1</th>
                <th className="px-6 py-4 font-black tracking-wider uppercase">Day 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { id: 1, name: "YouTube Videos", day1: "Wednesday", day2: "Saturday" },
                { id: 2, name: "TikTok Videos", day1: "Monday", day2: "Thursday" },
                { id: 3, name: "Surveys", day1: "Tuesday", day2: "Friday" },
                { id: 4, name: "Reels", day1: "Wednesday", day2: "Sunday" },
                { id: 5, name: "Article Writing", day1: "Monday", day2: "Friday" },
                { id: 6, name: "Click Ads", day1: "Tuesday", day2: "Thursday" },
                { id: 7, name: "Hotel Reviews", day1: "Wednesday", day2: "Saturday" },
              ].map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[#f8f9fc]">
                  <td className="px-6 py-4">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#1abc9c] text-sm font-black text-white shadow-sm">
                      {row.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#112a46] text-base">{row.name}</td>
                  <td className="px-6 py-4 font-medium text-gray-500">{row.day1}</td>
                  <td className="px-6 py-4 font-medium text-gray-500">{row.day2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Balance Section */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46] uppercase">
          Service Balance
        </h3>
        
        <div className="flex flex-col gap-4">
          {[
            { name: "Chat & Teaching Earnings", id: "chat", amount: stats.serviceBalances?.chat || 0, icon: "💬", color: "bg-emerald-500", link: "/withdraw/chat" },
            { name: "Ads Earnings", id: "ads", amount: stats.serviceBalances?.ads || 0, icon: "📺", color: "bg-blue-400", link: "/withdraw/ads" },
            { name: "TikTok Earnings", id: "tiktok", amount: stats.serviceBalances?.tiktok || 0, icon: "🎵", color: "bg-orange-400", link: "/withdraw/tiktok" },
            { name: "YouTube Earnings", id: "youtube", amount: stats.serviceBalances?.youtube || 0, icon: "▶️", color: "bg-red-500", link: "/withdraw/youtube" },
            { name: "Survey Earnings", id: "survey", amount: stats.serviceBalances?.survey || 0, icon: "📋", color: "bg-teal-500", link: "/withdraw/survey" },
            { name: "Blog Earnings", id: "blog", amount: stats.serviceBalances?.blog || 0, icon: "✍️", color: "bg-pink-400", link: "/withdraw/blog" },
            { name: "Hotel Reviews Earnings", id: "hotel_review", amount: stats.serviceBalances?.hotel_review || 0, icon: "🏨", color: "bg-indigo-500", link: "/withdraw/hotel-reviews" },
          ].map((service, idx) => (
            <Link 
              href={service.link} 
              key={idx} 
              className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0 hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${service.color}`}>
                  {service.icon}
                </div>
                <span className="text-sm font-bold text-gray-700">{service.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-[#1abc9c]">
                  {stats.currency} {maskMoney(service.amount)}
                </span>
                <span className="text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}