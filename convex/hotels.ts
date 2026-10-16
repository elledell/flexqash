import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Checks how many times a user has reviewed each hotel in the last 24 hours
export const getUserReviewStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Get all user's reviews from the last 24 hours
    const recentReviews = await ctx.db
      .query("hotelReviews")
      .withIndex("by_user_hotel", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();

    // Map the counts: { "hotel-1": 1, "hotel-2": 0 }
    const stats: Record<string, number> = {};
    for (const review of recentReviews) {
      stats[review.hotelId] = (stats[review.hotelId] || 0) + 1;
    }

    return stats;
  },
});

export const submitReview = mutation({
  args: {
    hotelId: v.string(),
    rating: v.number(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentReviews = await ctx.db
      .query("hotelReviews")
      .withIndex("by_user_hotel", (q) => 
        q.eq("userId", userId).eq("hotelId", args.hotelId)
      )
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();

    // Strict 1-per-day limit
    if (recentReviews.length >= 1) {
      throw new ConvexError("You have already reviewed this hotel today. Check back tomorrow!");
    }

    const setting = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", "hotel_review_reward"))
      .first();
    const rewardAmount = setting?.value || 50; 

    await ctx.db.insert("hotelReviews", {
      userId,
      hotelId: args.hotelId,
      rating: args.rating,
      feedback: args.feedback,
      createdAt: now,
    });

    await ctx.db.insert("serviceEarnings", {
      userId,
      amount: rewardAmount,
      source: "hotel_review",
    });

    return { success: true, message: `Review submitted! You earned ${rewardAmount} Coins.` };
  },
});