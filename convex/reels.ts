import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const BASE_REWARD_KES = 10; // 10 KES per Reel
const MAX_VIDEOS_PER_WEEK = 10; // 10 videos = 100 KES total per week

// Utility to get Monday midnight of the current week
function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

export const getReelsStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Fetch all Reels service earnings for this user
    const allEarnings = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("source"), "reels"))
      .collect();

    const startOfWeek = getStartOfWeek();

    // Calculate total balance and videos watched this week
    const totalBalance = allEarnings.reduce((sum, e) => sum + e.amount, 0);
    const watchedThisWeek = allEarnings.filter((e) => e._creationTime >= startOfWeek).length;

    // Calculate localized reward
    const userCurrency = user.currency || "KES";
    let localizedReward = BASE_REWARD_KES;

    if (userCurrency !== "KES") {
      const allRates = await ctx.db.query("exchangeRates").collect();
      const rateDoc = allRates.find((r) => r.currency?.trim().toUpperCase() === userCurrency.toUpperCase());
      if (rateDoc) {
        const rate = typeof rateDoc.rateToKES === 'string' ? parseFloat(rateDoc.rateToKES) : rateDoc.rateToKES;
        if (!isNaN(rate) && rate > 0) localizedReward = Math.round(BASE_REWARD_KES * rate);
      }
    }

    return {
      currency: userCurrency,
      totalBalance,
      watchedThisWeek,
      availableThisWeek: Math.max(0, MAX_VIDEOS_PER_WEEK - watchedThisWeek),
      localizedReward,
    };
  },
});

export const claimVideoReward = mutation({
  args: { amount: v.number(), currency: v.string() },
  handler: async (ctx, { amount, currency }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const startOfWeek = getStartOfWeek();

    const recentWatches = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("source"), "reels"))
      .collect();

    const watchedThisWeek = recentWatches.filter((e) => e._creationTime >= startOfWeek).length;

    if (watchedThisWeek >= MAX_VIDEOS_PER_WEEK) {
      throw new ConvexError("You have reached your limit of 10 Reels for this week. Check back next Monday!");
    }

    // Insert into isolated service earnings
    await ctx.db.insert("serviceEarnings", {
      userId,
      amount,
      source: "reels",
    });

    return { success: true, message: `Successfully claimed ${currency} ${amount}!` };
  },
});