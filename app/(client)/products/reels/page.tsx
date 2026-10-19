"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

// 10 Reels videos with direct URLs
const REELS_VIDEOS = [
  { id: "r1", title: "Morning Productivity Routine", durationSeconds: 15, category: "Lifestyle", url: "https://www.instagram.com/reels/" },
  { id: "r2", title: "Top 5 Side Hustles in 2026", durationSeconds: 20, category: "Finance", url: "https://www.instagram.com/reels/" },
  { id: "r3", title: "Quick At-Home Workout", durationSeconds: 15, category: "Health", url: "https://www.instagram.com/reels/" },
  { id: "r4", title: "10-Minute Recipe Ideas", durationSeconds: 12, category: "Cooking", url: "https://www.instagram.com/reels/" },
  { id: "r5", title: "Marketing Psychology Tricks", durationSeconds: 30, category: "Business", url: "https://www.instagram.com/reels/" },
  { id: "r6", title: "Hidden iPhone Features", durationSeconds: 18, category: "Tech", url: "https://www.instagram.com/reels/" },
  { id: "r7", title: "Travel Hacks for Beginners", durationSeconds: 25, category: "Travel", url: "https://www.instagram.com/reels/" },
  { id: "r8", title: "Must-Read Books this Year", durationSeconds: 20, category: "Education", url: "https://www.instagram.com/reels/" },
  { id: "r9", title: "Graphic Design Tips", durationSeconds: 15, category: "Design", url: "https://www.instagram.com/reels/" },
  { id: "r10", title: "Daily Positive Affirmations", durationSeconds: 25, category: "Motivation", url: "https://www.instagram.com/reels/" }
];

export default function ReelsPage() {
  const router = useRouter();
  const stats = useQuery(api.reels.getReelsStats);
  const claimReward = useMutation(api.reels.claimVideoReward);

  const [activeVideo, setActiveVideo] = useState<typeof REELS_VIDEOS[0] | null>(null);
  const [timer, setTimer] = useState(0); 
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeVideo && !canClaim) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeVideo, canClaim]);

  const openVideo = (video: typeof REELS_VIDEOS[0]) => {
    setActiveVideo(video);
    setTimer(video.durationSeconds); 
    setCanClaim(false);
    // Open Reels in a new tab immediately
    window.open(video.url, '_blank');
  };

  const handleClaim = async () => {
    if (!stats) return;
    setClaiming(true);
    try {
      await claimReward({ amount: stats.localizedReward, currency: stats.currency });
      setActiveVideo(null);
    } catch (e: any) {
      const errorMsg = e?.data || e?.message || "An error occurred.";
      alert(errorMsg.replace(/^Uncaught Error: ConvexError: /, '').replace(/^ConvexError: /, ''));
    } finally {
      setClaiming(false);
    }
  };

  if (!stats) return <div className="p-8 text-center font-bold text-[#112a46]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Reels Earnings</h1>
        <button onClick={() => router.push("/dashboard")} className="text-sm font-bold text-gray-500 hover:text-[#1abc9c]">
          « Dashboard
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Wallet Balance</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">💰</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">
            {stats.currency} {stats.totalBalance.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">Available in Service Balance</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Reels Completed</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">☑️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.watchedThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">10 total limit per week</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Reels Available</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1abc9c]/10 text-[#1abc9c]">🎬</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.availableThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">Start earning now</p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {REELS_VIDEOS.map((video, index) => (
          <div key={video.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
            
            {/* Stylized Reels Gradient Thumbnail */}
            <div className="relative flex h-40 w-full flex-col items-center justify-center bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white">
              <span className="text-4xl">🎬</span>
              <span className="mt-2 text-xs font-bold text-white/90">Reel #{index + 1}</span>
              <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                {video.durationSeconds}s
              </div>
            </div>
            
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-[#112a46]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#112a46]">
                  {video.category}
                </span>
                <span className="text-xs font-black text-emerald-500">
                  +{stats.localizedReward} {stats.currency}
                </span>
              </div>
              <h3 className="mb-4 line-clamp-2 text-sm font-bold text-[#112a46] leading-tight">{video.title}</h3>
              
              <button
                onClick={() => openVideo(video)}
                disabled={stats.availableThisWeek <= 0}
                className="mt-auto w-full rounded-xl bg-[#112a46] py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#1a3a5e] disabled:opacity-50"
              >
                {stats.availableThisWeek <= 0 ? "Limit Reached" : "Watch Reel"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Watch Modal (Redirect Experience) */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112a46]/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between bg-gray-50 px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#112a46] text-sm line-clamp-1 flex-1 pr-4">Task In Progress</h3>
              <button onClick={() => setActiveVideo(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl leading-none">
                ✕
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
                👀
              </div>
              <h4 className="mb-2 text-lg font-black text-[#112a46]">Reel Opened!</h4>
              <p className="text-sm text-gray-500 mb-6">
                We opened the Reel in a new tab. Please watch it to support the creator, then return here to claim your reward.
              </p>

              {!canClaim ? (
                <div className="w-full rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-sm font-bold text-orange-600">
                    Reward unlocks in {timer} seconds...
                  </p>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-emerald-600">
                    Task complete! You can now claim.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-5">
              <button
                onClick={handleClaim}
                disabled={!canClaim || claiming}
                className="w-full rounded-xl bg-[#1abc9c] py-3.5 font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {claiming ? "Claiming..." : `Claim ${stats.currency} ${stats.localizedReward}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}