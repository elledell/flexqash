"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

// Added durationSeconds for the timer logic, and switched to hqdefault.jpg to fix missing thumbnails
const YOUTUBE_VIDEOS = [
  {
    id: "v1",
    title: "Inside the mind of a master procrastinator | Tim Urban",
    desc: "Tim Urban encourages us to think harder about what we're really procrastinating on, before we run out of time.",
    duration: "14:03",
    durationSeconds: 843,
    thumbnail: "https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/arj7oStGLkU",
    category: "TED Talk"
  },
  {
    id: "v2",
    title: "Understand Calculus in 10 Minutes",
    desc: "A quick, intuitive understanding of Calculus concepts perfect for students and professionals.",
    duration: "10:14",
    durationSeconds: 614,
    thumbnail: "https://img.youtube.com/vi/WgBeu3FViBw/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/WgBeu3FViBw",
    category: "Math Class"
  },
  {
    id: "v3",
    title: "God Is Writing Your Story | Steven Furtick",
    desc: "Pastor Steven Furtick delivers a powerful message about trusting the process and finding faith.",
    duration: "45:20",
    durationSeconds: 2720,
    thumbnail: "https://img.youtube.com/vi/EN1RvuXNfGQ/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/EN1RvuXNfGQ",
    category: "Preaching"
  },
  {
    id: "v4",
    title: "The power of vulnerability | Brené Brown",
    desc: "Brené Brown shares a deep insight from her research, one that sent her on a personal quest to know herself.",
    duration: "20:19",
    durationSeconds: 1219,
    thumbnail: "https://img.youtube.com/vi/iCvmsMzlF7o/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/iCvmsMzlF7o",
    category: "TED Talk"
  },
  {
    id: "v5",
    title: "How to speak so that people want to listen | Julian Treasure",
    desc: "Have you ever felt like you're talking, but nobody is listening? Here's Julian Treasure to help you fix that.",
    duration: "9:58",
    durationSeconds: 598,
    thumbnail: "https://img.youtube.com/vi/eIho2S0ZahI/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/eIho2S0ZahI",
    category: "TED Talk"
  },
  {
    id: "v6",
    title: "100+ Computer Science Concepts Explained",
    desc: "Learn the fundamentals of Computer Science with a rapid-fire breakdown of the most important concepts.",
    duration: "13:08",
    durationSeconds: 788,
    thumbnail: "https://img.youtube.com/vi/-uleG_Vecis/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/-uleG_Vecis",
    category: "Tech Class"
  }
];

// Helper to format remaining seconds into MM:SS
const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function YouTubePage() {
  const router = useRouter();
  const stats = useQuery(api.youtube.getYoutubeStats);
  const claimReward = useMutation(api.youtube.claimVideoReward);

  const [activeVideo, setActiveVideo] = useState<typeof YOUTUBE_VIDEOS[0] | null>(null);
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

  const openVideo = (video: typeof YOUTUBE_VIDEOS[0]) => {
    setActiveVideo(video);
    setTimer(video.durationSeconds); // Sets timer to exact video length
    setCanClaim(false);
  };

  const handleClaim = async () => {
    if (!stats) return;
    setClaiming(true);
    try {
      await claimReward({ amount: stats.localizedReward, currency: stats.currency });
      setActiveVideo(null);
    } catch (e: any) {
      alert(e.data || e.message);
    } finally {
      setClaiming(false);
    }
  };

  if (!stats) return <div className="p-8 text-center font-bold text-[#112a46]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">YouTube Earnings</h1>
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
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Videos Completed</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">☑️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.watchedThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">2 total limit per week</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Videos Available</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1abc9c]/10 text-[#1abc9c]">▶️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.availableThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">Start earning now</p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {YOUTUBE_VIDEOS.map((video) => (
          <div key={video.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-48 w-full bg-gray-200">
              <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
              <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-bold text-white">
                {video.duration}
              </div>
            </div>
            
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-[#112a46]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#112a46]">
                  {video.category}
                </span>
                <span className="text-sm font-black text-emerald-500">
                  +{stats.localizedReward} {stats.currency}
                </span>
              </div>
              <h3 className="mb-2 line-clamp-2 text-base font-bold text-[#112a46] leading-tight">{video.title}</h3>
              <p className="mb-6 line-clamp-2 text-sm text-gray-500">{video.desc}</p>
              
              <button
                onClick={() => openVideo(video)}
                disabled={stats.availableThisWeek <= 0}
                className="mt-auto w-full rounded-xl bg-[#112a46] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1a3a5e] disabled:opacity-50"
              >
                {stats.availableThisWeek <= 0 ? "Weekly Limit Reached" : "Watch Video"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Watch Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112a46]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#112a46] line-clamp-1">{activeVideo.title}</h3>
              <button onClick={() => setActiveVideo(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">
                ✕
              </button>
            </div>
            
            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src={`${activeVideo.embedUrl}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
              <div>
                <p className="text-sm font-bold text-gray-500">Reward Status:</p>
                {!canClaim ? (
                  <p className="text-orange-500 font-bold">Watch for {formatTime(timer)} more minutes...</p>
                ) : (
                  <p className="text-[#1abc9c] font-bold">Task complete! You can now claim.</p>
                )}
              </div>
              <button
                onClick={handleClaim}
                disabled={!canClaim || claiming}
                className="rounded-xl bg-[#1abc9c] px-8 py-3.5 font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
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