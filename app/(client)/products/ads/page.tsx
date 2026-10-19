"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

// 10 Ads with real website URLs
const CLICK_ADS = [
  { id: "a1", title: "Premium Web Hosting", brand: "HostGator", desc: "Get 50% off on premium web hosting plans today.", url: "https://www.hostgator.com" },
  { id: "a2", title: "Learn Python Fast", brand: "Codecademy", desc: "Start your coding journey with our intensive Python course.", url: "https://www.codecademy.com" },
  { id: "a3", title: "Trade Crypto Securely", brand: "Binance", desc: "Join the world's largest crypto exchange.", url: "https://www.binance.com" },
  { id: "a4", title: "Start Dropshipping", brand: "Shopify", desc: "Build your online store with a 14-day free trial.", url: "https://www.shopify.com" },
  { id: "a5", title: "Remote Tech Jobs", brand: "Turing", desc: "Apply for top remote software engineering jobs.", url: "https://www.turing.com" },
  { id: "a6", title: "Master UI/UX Design", brand: "Figma", desc: "Collaborate and design better interfaces faster.", url: "https://www.figma.com" },
  { id: "a7", title: "Grow Your Audience", brand: "Mailchimp", desc: "Email marketing tools built for modern creators.", url: "https://mailchimp.com" },
  { id: "a8", title: "Fast Cloud Servers", brand: "DigitalOcean", desc: "Deploy your app in seconds with scalable droplets.", url: "https://www.digitalocean.com" },
  { id: "a9", title: "AI Writing Assistant", brand: "Grammarly", desc: "Write clear, mistake-free copy everywhere you type.", url: "https://www.grammarly.com" },
  { id: "a10", title: "Secure Your Data", brand: "NordVPN", desc: "Stay safe online with military-grade encryption.", url: "https://nordvpn.com" },
];

export default function ClickAdsPage() {
  const router = useRouter();
  const stats = useQuery(api.ads.getAdStats);
  const claimReward = useMutation(api.ads.claimAdReward);

  const [activeAd, setActiveAd] = useState<typeof CLICK_ADS[0] | null>(null);
  const [timer, setTimer] = useState(0); 
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeAd && !canClaim) {
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
  }, [activeAd, canClaim]);

  const openAd = (ad: typeof CLICK_ADS[0]) => {
    setActiveAd(ad);
    setTimer(10); // 10 seconds viewing time required
    setCanClaim(false);
    // Open ad in new tab
    window.open(ad.url, '_blank');
  };

  const handleClaim = async () => {
    if (!stats) return;
    setClaiming(true);
    try {
      await claimReward({ amount: stats.localizedReward, currency: stats.currency });
      setActiveAd(null);
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
        <h1 className="text-2xl font-bold text-[#112a46]">Click Ads Earnings</h1>
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
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ads Clicked</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">☑️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.clickedThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">10 total limit per week</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ads Available</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1abc9c]/10 text-[#1abc9c]">🖱️</span>
          </div>
          <h2 className="text-2xl font-black text-[#112a46]">{stats.availableThisWeek}</h2>
          <p className="mt-1 text-xs font-semibold text-gray-500">Start earning now</p>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {CLICK_ADS.map((ad) => (
          <div key={ad.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
            
            <div className="flex h-24 w-full flex-col items-center justify-center bg-gradient-to-br from-[#112a46] to-[#1a3a5e] text-white">
              <span className="text-2xl font-black tracking-widest opacity-20 uppercase">{ad.brand}</span>
            </div>
            
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-[#1abc9c]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1abc9c]">
                  Sponsored
                </span>
                <span className="text-xs font-black text-emerald-500">
                  +{stats.localizedReward} {stats.currency}
                </span>
              </div>
              <h3 className="mb-1 line-clamp-1 text-sm font-bold text-[#112a46]">{ad.title}</h3>
              <p className="mb-4 line-clamp-2 text-xs text-gray-500">{ad.desc}</p>
              
              <button
                onClick={() => openAd(ad)}
                disabled={stats.availableThisWeek <= 0}
                className="mt-auto w-full rounded-xl bg-[#112a46] py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#1a3a5e] disabled:opacity-50"
              >
                {stats.availableThisWeek <= 0 ? "Limit Reached" : "Click & View Ad"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Claim Modal */}
      {activeAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112a46]/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between bg-gray-50 px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#112a46] text-sm line-clamp-1 flex-1 pr-4">Task In Progress</h3>
              <button onClick={() => setActiveAd(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl leading-none">
                ✕
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
                🖱️
              </div>
              <h4 className="mb-2 text-lg font-black text-[#112a46]">Ad Opened!</h4>
              <p className="text-sm text-gray-500 mb-6">
                We opened the sponsor's website in a new tab. Please browse their site briefly, then return here to claim your reward.
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