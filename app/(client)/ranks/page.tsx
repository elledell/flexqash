"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

export default function RanksPage() {
  const topUsers = useQuery(api.leaderboard.getWeeklyRanks);
  const [isAnnouncementTime, setIsAnnouncementTime] = useState(false);

  useEffect(() => {
    // Check if it is currently after Saturday 2:00 PM EAT (UTC+3) or Sunday
    const now = new Date();
    const utcHours = now.getUTCHours();
    const eatHours = (utcHours + 3) % 24;
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    if ((dayOfWeek === 6 && eatHours >= 14) || dayOfWeek === 0) {
      setIsAnnouncementTime(true);
    }
  }, []);

  if (topUsers === undefined) {
    return <div className="flex min-h-screen items-center justify-center font-bold text-[#112a46]">Loading Leaderboard...</div>;
  }

  const first = topUsers[0];
  const second = topUsers[1];
  const third = topUsers[2];
  const runnerUps = topUsers.slice(3);

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Ranks & Rewards</h1>
        <div className="text-sm font-medium text-gray-500">
          Main » <span className="text-[#1abc9c]">Ranks</span>
        </div>
      </div>

      {/* 🏆 WEEKLY BROADCAST BANNER (Appears Saturday 2PM through Sunday) */}
      {isAnnouncementTime && first && (
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38728] p-6 text-white shadow-xl sm:p-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">📢</span>
            <span className="text-xs font-black uppercase tracking-widest text-white/90">Weekly Bonus Winners Announced!</span>
          </div>
          <p className="mt-2 text-lg font-bold leading-relaxed sm:text-xl">
            Congratulations to <span className="text-2xl font-black text-[#112a46] px-1">{first.username}</span> 
            (Number 1) who has added <span className="underline decoration-white decoration-4 underline-offset-4">{first.count} active users</span> this week! 
          </p>
          <p className="mt-4 text-sm font-semibold opacity-90">
            These are the people who have won this week's challenge. Keep referring to be featured next Saturday at 2:00 PM!
          </p>
        </div>
      )}

      {/* 📊 THE PODIUM (Top 3) */}
      <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
        <h3 className="mb-10 text-center text-lg font-black uppercase tracking-widest text-[#112a46]">Live Top 3 Standings</h3>
        
        {topUsers.length === 0 ? (
          <p className="text-center text-gray-400 font-bold">No active referrals this week yet. Be the first!</p>
        ) : (
          <div className="flex h-64 items-end justify-center gap-2 border-b border-gray-100 pb-0 sm:gap-6">
            
            {/* Rank 2 - Silver */}
            {second && (
              <div className="flex w-24 flex-col items-center sm:w-32">
                <span className="mb-2 truncate w-full text-center text-sm font-bold text-gray-600">@{second.username}</span>
                <span className="mb-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">{second.count} pts</span>
                <div className="flex h-32 w-full items-start justify-center rounded-t-lg bg-gradient-to-t from-gray-400 to-gray-200 shadow-inner">
                  <span className="mt-4 text-3xl font-black text-white drop-shadow-md">2</span>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold */}
            {first && (
              <div className="flex w-28 flex-col items-center sm:w-40 z-10">
                <span className="mb-2 text-3xl drop-shadow-lg">👑</span>
                <span className="mb-2 truncate w-full text-center text-base font-black text-[#d4af37]">@{first.username}</span>
                <span className="mb-2 rounded-full bg-[#fef9c3] px-4 py-1 text-sm font-black text-[#b45309]">{first.count} pts</span>
                <div className="flex h-48 w-full items-start justify-center rounded-t-lg bg-gradient-to-t from-[#b38728] to-[#d4af37] shadow-xl">
                  <span className="mt-4 text-5xl font-black text-white drop-shadow-md">1</span>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {third && (
              <div className="flex w-24 flex-col items-center sm:w-32">
                <span className="mb-2 truncate w-full text-center text-sm font-bold text-orange-800">@{third.username}</span>
                <span className="mb-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">{third.count} pts</span>
                <div className="flex h-24 w-full items-start justify-center rounded-t-lg bg-gradient-to-t from-[#b45309] to-[#d97706] shadow-inner">
                  <span className="mt-2 text-2xl font-black text-white drop-shadow-md">3</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🏃‍♂️ RUNNER UPS (Ranks 4 - 10) */}
      {runnerUps.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">THE CONTENDERS (Top 10)</h3>
          <div className="space-y-3">
            {runnerUps.map((user, index) => (
              <div key={user.username} className="flex items-center justify-between rounded-xl bg-gray-50 p-4 transition hover:bg-gray-100">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-black text-gray-500">
                    {index + 4}
                  </span>
                  <span className="font-bold text-[#112a46]">@{user.username}</span>
                </div>
                <span className="font-bold text-[#1abc9c]">{user.count} active users</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}