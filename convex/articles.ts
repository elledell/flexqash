import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const BASE_REWARD_KES = 100; // 100 KES reward per article
const MAX_ARTICLES_PER_DAY = 1; // Limit: 1 per day

// Utility to get midnight of the current day in local time
function getStartOfDay() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

export const getArticleStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Fetch all Article service earnings for this user
    const allEarnings = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("source"), "article"))
      .collect();

    const startOfDay = getStartOfDay();

    // Calculate total balance and articles completed today
    const totalBalance = allEarnings.reduce((sum, e) => sum + e.amount, 0);
    const completedToday = allEarnings.filter((e) => e._creationTime >= startOfDay).length;

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
      completedToday,
      availableToday: Math.max(0, MAX_ARTICLES_PER_DAY - completedToday),
      localizedReward,
    };
  },
});

export const submitArticleReward = mutation({
  args: { 
    amount: v.number(), 
    currency: v.string(),
    content: v.string() // We pass the content just to validate it's not empty
  },
  handler: async (ctx, { amount, currency, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    if (content.trim().split(/\s+/).length < 50) {
      throw new ConvexError("Article must be at least 50 words.");
    }

    const startOfDay = getStartOfDay();

    const recentArticles = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("source"), "article"))
      .collect();

    const completedToday = recentArticles.filter((e) => e._creationTime >= startOfDay).length;

    if (completedToday >= MAX_ARTICLES_PER_DAY) {
      throw new ConvexError("You have already submitted an article today. Check back tomorrow!");
    }

    // Insert into isolated service earnings
    await ctx.db.insert("serviceEarnings", {
      userId,
      amount,
      source: "article",
    });

    return { success: true, message: `Article approved! You earned ${currency} ${amount}.` };
  },
});