"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

export default function RanksPage() {
  const topUsers = useQuery(api.leaderboard.getWeeklyRanks);
  const [isAnnouncementTime, setIsAnnouncementTime] = useState(false);

  useEffect(() => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const eatHours = (utcHours + 3) % 24;
    const dayOfWeek = now.getDay(); 

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

      {!isAnnouncementTime ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <span className="mb-6 text-7xl drop-shadow-sm">⏳</span>
          <h2 className="mb-4 text-2xl font-black uppercase tracking-widest text-[#112a46] sm:text-3xl">
            The Leaderboard is Hidden
          </h2>
          <p className="max-w-md text-base font-semibold leading-relaxed text-gray-500">
            We are actively tallying this week's top performers! The final ranks and the winner will be revealed this <strong className="text-[#1abc9c]">Saturday at 2:00 PM</strong> and stay visible all day Sunday.
            <br /><br />
            Keep referring to secure your spot at the top. The countdown is on!
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {first && (
            <div className="mb-10 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38728] p-6 text-white shadow-xl sm:p-8">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">📢</span>
                <span className="text-xs font-black uppercase tracking-widest text-white/90">Weekly Bonus Winners Announced!</span>
              </div>
              <p className="mt-2 text-lg font-bold leading-relaxed sm:text-xl">
                Congratulations to <span className="px-1 text-2xl font-black text-[#112a46]">@{first.username}</span> 
                (Number 1) who has added <span className="underline decoration-white decoration-4 underline-offset-4">the highest number of active users</span> this week! 
              </p>
              <p className="mt-4 text-sm font-semibold opacity-90">
                These are the people who have won this week's challenge. Keep referring to be featured next Saturday at 2:00 PM!
              </p>
            </div>
          )}

          <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
            <h3 className="mb-10 text-center text-lg font-black uppercase tracking-widest text-[#112a46]">Live Top 3 Standings</h3>
            
            {topUsers.length === 0 ? (
              <p className="text-center font-bold text-gray-400">No active referrals this week yet. Be the first!</p>
            ) : (
              <div className="flex h-64 items-end justify-center gap-2 border-b border-gray-100 pb-0 sm:gap-6">
                
                {second && (
                  <div className="flex w-24 flex-col items-center sm:w-32">
                    <span className="mb-2 w-full truncate text-center text-sm font-bold text-gray-600">@{second.username}</span>
                    <span className="mb-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">Elite</span>
                    <div className="flex h-32 w-full items-start justify-center rounded-t-lg bg-gradient-to-t from-gray-400 to-gray-200 shadow-inner">
                      <span className="mt-4 text-3xl font-black text-white drop-shadow-md">2</span>
                    </div>
                  </div>
                )}

                {first && (
                  <div className="z-10 flex w-28 flex-col items-center sm:w-40">
                    <span className="mb-2 text-3xl drop-shadow-lg">👑</span>
                    <span className="mb-2 w-full truncate text-center text-base font-black text-[#d4af37]">@{first.username}</span>
                    <span className="mb-2 rounded-full bg-[#fef9c3] px-4 py-1 text-sm font-black text-[#b45309]">Champion</span>
                    <div className="flex h-48 w-full items-start justify-center rounded-t-lg bg-gradient-to-t from-[#b38728] to-[#d4af37] shadow-xl">
                      <span className="mt-4 text-5xl font-black text-white drop-shadow-md">1</span>
                    </div>
                  </div>
                )}

                {third && (
                  <div className="flex w-24 flex-col items-center sm:w-32">
                    <span className="mb-2 w-full truncate text-center text-sm font-bold text-orange-800">@{third.username}</span>
                    <span className="mb-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">Pro</span>
                    <div className="flex h-24 w-full items-start justify-center rounded-t-lg bg-gradient-to-t from-[#b45309] to-[#d97706] shadow-inner">
                      <span className="mt-2 text-2xl font-black text-white drop-shadow-md">3</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
                    <span className="font-bold text-[#1abc9c]">Contender</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}