import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const BASE_REWARD_KES = 50; // 50 KES reward per survey
const MAX_SURVEYS_PER_WEEK = 1; // Strict limit: 1 survey per week

// Utility to get Monday midnight of the current week
function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

export const getSurveyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Fetch all Survey service earnings for this user
    const allEarnings = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("source"), "survey"))
      .collect();

    const startOfWeek = getStartOfWeek();

    // Calculate total balance and surveys completed this week
    const totalBalance = allEarnings.reduce((sum, e) => sum + e.amount, 0);
    const completedThisWeek = allEarnings.filter((e) => e._creationTime >= startOfWeek).length;

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
      completedThisWeek,
      availableThisWeek: Math.max(0, MAX_SURVEYS_PER_WEEK - completedThisWeek),
      localizedReward,
    };
  },
});

export const submitSurveyReward = mutation({
  args: { amount: v.number(), currency: v.string() },
  handler: async (ctx, { amount, currency }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const startOfWeek = getStartOfWeek();

    const recentSurveys = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("source"), "survey"))
      .collect();

    const completedThisWeek = recentSurveys.filter((e) => e._creationTime >= startOfWeek).length;

    if (completedThisWeek >= MAX_SURVEYS_PER_WEEK) {
      throw new ConvexError("You have already completed your weekly survey. Check back next Monday!");
    }

    // Insert into isolated service earnings
    await ctx.db.insert("serviceEarnings", {
      userId,
      amount,
      source: "survey",
    });

    return { success: true, message: `Survey completed! You earned ${currency} ${amount}!` };
  },
});