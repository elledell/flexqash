"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConvexError } from "convex/values";

// Static premium hotel data
const STATIC_HOTELS = [
  {
    id: "hotel-1",
    name: "The Maasai Mara Lodge",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
    location: "Narok, Kenya",
  },
  {
    id: "hotel-2",
    name: "Diani Beach Resort & Spa",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    location: "Mombasa, Kenya",
  },
  {
    id: "hotel-3",
    name: "Serengeti Oasis",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    location: "Serengeti, Tanzania",
  },
  {
    id: "hotel-4",
    name: "Zanzibar Ocean View",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    location: "Zanzibar, Tanzania",
  },
  {
    id: "hotel-5",
    name: "Kigali Horizon Hotel",
    image: "https://images.unsplash.com/photo-1542314831-c6a420325142?w=800&q=80",
    location: "Kigali, Rwanda",
  },
  {
    id: "hotel-6",
    name: "Entebbe Lakefront Suites",
    image: "https://images.unsplash.com/photo-1551882547-ff40c0d589rx?w=800&q=80",
    location: "Entebbe, Uganda",
  }
];

export default function HotelReviewsPage() {
  const reviewStats = useQuery(api.hotels.getUserReviewStats);
  const submitReview = useMutation(api.hotels.submitReview);

  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent, hotelId: string) => {
    e.preventDefault();
    if (rating === 0) return setError("Please select a star rating.");
    if (feedback.trim().length < 10) return setError("Please write a slightly longer review.");
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await submitReview({
        hotelId,
        rating,
        feedback,
      });
      setSuccess(result.message);
      setSelectedHotel(null);
      setRating(0);
      setFeedback("");
    } catch (err) {
      setError(err instanceof ConvexError ? err.data as string : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (reviewStats === undefined) {
    return <div className="flex min-h-[50vh] items-center justify-center font-bold text-[#112a46]">Loading Hotels...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46] flex items-center gap-2">
          <span>🏨</span> Premium Hotel Reviews
        </h1>
      </div>

      <p className="mb-8 text-sm text-gray-500 max-w-2xl">
        Rate your experiences and write helpful feedback for these top destinations. 
        You can review each hotel <strong className="text-[#1abc9c]">once a day</strong> to earn coins. 
      </p>

      {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600">❌ {error}</div>}
      {success && <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm font-bold text-emerald-700">✅ {success}</div>}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {STATIC_HOTELS.map((hotel) => {
          const timesReviewedToday = reviewStats[hotel.id] || 0;
          const isLocked = timesReviewedToday >= 1;

          return (
            <div 
              key={hotel.id} 
              className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md flex flex-col ${isLocked ? "grayscale-[20%]" : ""}`}
            >
              {/* Hotel Image */}
              <div className="h-48 w-full bg-gray-200">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex flex-1 flex-col p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-black text-[#112a46]">{hotel.name}</h3>
                </div>
                
                <p className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-1">
                  📍 {hotel.location}
                </p>

                {/* Conditional UI based on lock status */}
                {isLocked ? (
                  <div className="mt-auto flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-4 px-2 text-center">
                    <span className="mb-1 text-xl">⏳</span>
                    <p className="text-xs font-bold text-gray-500">You've already reviewed this hotel today. Check back tomorrow!</p>
                  </div>
                ) : selectedHotel === hotel.id ? (
                  <form onSubmit={(e) => handleSubmit(e, hotel.id)} className="mt-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${rating >= star ? "text-yellow-400" : "text-gray-200"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Write your review here..."
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-[#1abc9c] focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setSelectedHotel(null); setRating(0); setError(""); }}
                        className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" disabled={loading}
                        className="flex-1 rounded-xl bg-[#1abc9c] py-2.5 text-xs font-bold text-white hover:bg-[#16a085] disabled:opacity-50"
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => { setSelectedHotel(hotel.id); setRating(0); setError(""); }}
                    className="mt-auto w-full rounded-xl bg-[#112a46] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1a3a5e]"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}