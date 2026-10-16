"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";

// Static Event Data
const STATIC_GIGS = [
  {
    id: "gig-1",
    name: "Neyo Rnb Night",
    location: "Ulinzi Complex",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    jobs: ["Vendors", "Brand Promoters", "Ticket Attendants", "Merch Sales"],
    earnUpTo: 5000,
    bidCostKES: 200,
    date: { day: "TUESDAY", date: "20", month: "OCTOBER", year: "2026" }
  },
  {
    id: "gig-2",
    name: "Safari Sevens (7)",
    location: "Nyayo Stadium",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
    jobs: ["Ticket Attendants", "Vendors", "Brand Promoters", "Medics"],
    earnUpTo: 5000,
    bidCostKES: 150,
    date: { day: "FRIDAY", date: "09", month: "OCTOBER", year: "2026" }
  },
  {
    id: "gig-3",
    name: "Korom Festival",
    location: "AskArena Jamhuri",
    image: "https://images.unsplash.com/photo-1533174000222-1d120a1ce247?w=800&q=80",
    jobs: ["Ticket Attendants", "Brand Promoters", "Merch Sales", "Food / drink vendors"],
    earnUpTo: 5000,
    bidCostKES: 250,
    date: { day: "SATURDAY", date: "17", month: "OCTOBER", year: "2026" }
  },
  {
    id: "gig-4",
    name: "Colours of Courage",
    location: "Jamhuri Park",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    jobs: ["Vendors", "Merch Sales", "Ticket Attendants", "Brand Promoters"],
    earnUpTo: 5000,
    bidCostKES: 100,
    date: { day: "SATURDAY", date: "24", month: "OCTOBER", year: "2026" }
  }
];

export default function GigsPage() {
  const router = useRouter();
  const userApplications = useQuery(api.gigs.getUserApplications);
  const applyForGig = useMutation(api.gigs.applyForGig);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shortfall, setShortfall] = useState<{ amount: number; currency: string } | null>(null);

  const handleApply = async (gig: typeof STATIC_GIGS[0]) => {
    setError("");
    setSuccess("");
    setShortfall(null);
    setLoadingId(gig.id);

    try {
      const result = await applyForGig({ 
        gigId: gig.id, 
        bidCostKES: gig.bidCostKES,
        gigName: gig.name 
      });
      setSuccess(result.message);
    } catch (err) {
      if (err instanceof ConvexError) {
        const data = err.data as any;
        if (data?.code === "INSUFFICIENT_FUNDS") {
          setShortfall({ amount: data.shortfall, currency: data.currency });
        } else {
          setError(typeof data === "string" ? data : data.message || "Application failed.");
        }
      } else {
        setError("A network error occurred.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (userApplications === undefined) {
    return <div className="flex min-h-[50vh] items-center justify-center font-bold text-[#112a46]">Loading Events...</div>;
  }

  // Create a quick lookup set for applied gigs
  const appliedGigIds = new Set(userApplications.map((app: any) => app.gigId));

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8 font-sans text-[#112a46]">
      
      {/* Hero Header */}
      <div className="mb-10 text-center md:text-left md:flex justify-between items-end border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#112a46] mb-2 tracking-tight">
            Find Events.<br/>Find Gigs.<br/>
            <span className="text-[#1abc9c]">Get Paid</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium">The #1 platform connecting organizers with trusted workers.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4 text-center">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-black text-[#112a46]">2,350+</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Events This Month</div>
          </div>
        </div>
      </div>

      {/* Dynamic Top-Up Redirect Card */}
      {shortfall && (
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 shadow-sm md:flex-row animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-2xl">
              💳
            </div>
            <div>
              <h3 className="text-lg font-black text-red-900">Insufficient Bidding Funds</h3>
              <p className="text-sm font-medium text-red-700">
                You are short <strong className="text-red-900 bg-white px-1.5 py-0.5 rounded text-xs">{shortfall.currency} {shortfall.amount.toLocaleString()}</strong> to bid on this gig.
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

      {error && !shortfall && (
        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">❌ {error}</div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">✅ {success}</div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#112a46] tracking-wide flex items-center gap-2">
          <span>🎟️</span> Hot Jobs Near You
        </h2>
        <button className="text-sm font-bold text-[#1abc9c] border border-[#1abc9c] bg-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-[#1abc9c] hover:text-white transition">
          View All &gt;
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {STATIC_GIGS.map((gig) => {
          const hasApplied = appliedGigIds.has(gig.id);

          return (
            <div key={gig.id} className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col transition hover:shadow-md">
              <div className="h-48 w-full bg-gray-200 relative">
                <img src={gig.image} alt={gig.name} className="h-full w-full object-cover" />
              </div>
              
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-black text-[#112a46] mb-1">{gig.name}</h3>
                <p className="text-sm font-bold text-gray-500 mb-5 flex items-center gap-1">
                  <span className="text-lg">📍</span> {gig.location}
                </p>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Jobs Available</span>
                    <div className="h-px bg-gray-100 flex-1"></div>
                  </div>
                  <ul className="space-y-1.5">
                    {gig.jobs.map((job, idx) => (
                      <li key={idx} className="text-sm font-bold text-[#112a46] flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1abc9c]"></span> {job}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Earn Up To</p>
                  <p className="text-3xl font-black text-[#1abc9c] italic mb-1 tracking-tighter">
                    <span className="text-lg font-bold not-italic text-gray-400 mr-1">KSH</span>
                    {gig.earnUpTo.toLocaleString()}
                  </p>
                  <div className="inline-block bg-[#e0f2f1] text-[#1abc9c] text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-6">
                    Depending on the role
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-[#112a46] text-3xl">📅</div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{gig.date.day}</div>
                        <div className="text-2xl font-black text-[#112a46] leading-none">{gig.date.date}</div>
                      </div>
                      <div className="w-px h-8 bg-gray-200 mx-1"></div>
                      <div className="text-left">
                        <div className="text-[10px] font-black text-[#1abc9c] uppercase tracking-widest">{gig.date.month}</div>
                        <div className="text-lg font-black text-[#112a46] leading-tight">{gig.date.year}</div>
                      </div>
                    </div>
                  </div>

                  {hasApplied ? (
                    <button disabled className="w-full rounded-xl bg-gray-100 py-3.5 text-sm font-bold text-gray-400 uppercase tracking-widest border border-gray-200">
                      Applied ✓
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(gig)}
                      disabled={loadingId === gig.id}
                      className="w-full rounded-xl bg-[#112a46] hover:bg-[#1a3a5e] shadow-md transition py-3.5 text-sm font-black text-white uppercase tracking-widest disabled:opacity-50"
                    >
                      {loadingId === gig.id ? "Bidding..." : `Apply Now (Bid: ${gig.bidCostKES} KES)`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}