"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

const DAILY_TOPICS = [
  "The Future of AI in African Tech Startups",
  "How Remote Work is Changing the Global Economy",
  "Top 5 Financial Habits for Young Professionals",
  "The Impact of Social Media on Modern Marketing",
  "Sustainable Business Practices for 2026"
];

export default function ArticleWritingPage() {
  const router = useRouter();
  const stats = useQuery(api.articles.getArticleStats);
  const submitReward = useMutation(api.articles.submitArticleReward);

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pick a pseudo-random topic based on today's date so it changes daily
  const todayIndex = new Date().getDate() % DAILY_TOPICS.length;
  const currentTopic = DAILY_TOPICS[todayIndex];

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isEligible = wordCount >= 50;

  const handleSubmit = async () => {
    if (!stats || !isEligible) return;
    setSubmitting(true);
    try {
      await submitReward({ 
        amount: stats.localizedReward, 
        currency: stats.currency,
        content: content 
      });
      setContent("");
    } catch (e: any) {
      const errorMsg = e?.data || e?.message || "An error occurred.";
      alert(errorMsg.replace(/^Uncaught Error: ConvexError: /, '').replace(/^ConvexError: /, ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (!stats) return <div className="p-8 text-center font-bold text-[#112a46]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Article Writing</h1>
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
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Articles Today</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">☑️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.completedToday}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">1 total limit per day</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Articles Available</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1abc9c]/10 text-[#1abc9c]">✍️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.availableToday}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">Start earning now</p>
        </div>
      </div>

      {/* Writing Pad */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-[#112a46]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#112a46]">
                Today's Topic
              </span>
              <span className="text-sm font-black text-emerald-500">
                +{stats.localizedReward} {stats.currency}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#112a46]">{currentTopic}</h3>
            <p className="mt-1 text-xs text-gray-500">Write a minimum of 50 words to qualify for today's payout.</p>
          </div>

          <div className="p-6 sm:p-8">
            <textarea
              disabled={stats.availableToday <= 0 || submitting}
              className="h-64 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-[#112a46] outline-none transition focus:border-[#1abc9c] focus:bg-white disabled:opacity-50"
              placeholder={stats.availableToday <= 0 ? "You have reached your daily limit. Check back tomorrow!" : "Start typing your article here..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className={wordCount >= 50 ? "text-emerald-500" : "text-orange-500"}>
                  {wordCount} / 50 words
                </span>
                {wordCount >= 50 && <span className="text-emerald-500">✅</span>}
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={stats.availableToday <= 0 || !isEligible || submitting}
                className="w-full sm:w-auto rounded-xl bg-[#1abc9c] px-10 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {stats.availableToday <= 0 
                  ? "Daily Limit Reached" 
                  : submitting 
                    ? "Submitting..." 
                    : !isEligible 
                      ? "Write 50 words to submit" 
                      : `Submit & Claim ${stats.currency} ${stats.localizedReward}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}