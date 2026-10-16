import { ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const BONUS_MILESTONE = 30;
const BASE_BONUS_KES = 200;

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // 1. Get all downlines and count strictly the "active" ones
    const downlines = await ctx.db
      .query("users")
      .withIndex("by_invitedBy", (q) => q.eq("invitedBy", userId))
      .collect();
    
    const activeReferrals = downlines.filter((u) => u.membership === "active").length;

    // 2. Count how many times they have already claimed the agent bonus
    const claimedBonuses = await ctx.db
      .query("earnings")
      .withIndex("by_user_source", (q) => q.eq("userId", userId).eq("source", "agent_bonus"))
      .collect();
    
    const claimCount = claimedBonuses.length;

    // 3. Calculate current progress toward the NEXT milestone of 30
    const currentProgress = activeReferrals - (claimCount * BONUS_MILESTONE);
    const progressPercentage = Math.min((currentProgress / BONUS_MILESTONE) * 100, 100);
    const canClaim = currentProgress >= BONUS_MILESTONE;

    return {
      activeReferrals,
      claimed: claimCount,
      currentProgress,
      target: BONUS_MILESTONE,
      progressPercentage,
      canClaim,
    };
  },
});

export const claimAgentBonus = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Account not found");

    // 1. Re-run calculations strictly on the server to prevent manipulation
    const downlines = await ctx.db
      .query("users")
      .withIndex("by_invitedBy", (q) => q.eq("invitedBy", userId))
      .collect();
    const activeReferrals = downlines.filter((u) => u.membership === "active").length;

    const claimedBonuses = await ctx.db
      .query("earnings")
      .withIndex("by_user_source", (q) => q.eq("userId", userId).eq("source", "agent_bonus"))
      .collect();
    const claimCount = claimedBonuses.length;

    const currentProgress = activeReferrals - (claimCount * BONUS_MILESTONE);

    if (currentProgress < BONUS_MILESTONE) {
      throw new ConvexError(`You need ${BONUS_MILESTONE - currentProgress} more active users to claim this bonus.`);
    }

    // 2. Convert 200 KES into the user's local currency
    const userCurrency = user.currency || "KES";
    let payoutAmount = BASE_BONUS_KES;

    if (userCurrency !== "KES") {
      const allRates = await ctx.db.query("exchangeRates").collect();
      const rateDoc = allRates.find((r) => r.currency?.trim().toUpperCase() === userCurrency.toUpperCase());
      
      if (rateDoc) {
        const rate = typeof rateDoc.rateToKES === 'string' ? parseFloat(rateDoc.rateToKES) : rateDoc.rateToKES;
        if (!isNaN(rate) && rate > 0) {
          payoutAmount = Math.round(BASE_BONUS_KES * rate);
        }
      }
    }

    // 3. Issue the funds to the earnings ledger
    await ctx.db.insert("earnings", {
      userId: user._id,
      amount: payoutAmount,
      currency: userCurrency,
      source: "agent_bonus",
    });

    return { success: true, amount: payoutAmount, currency: userCurrency };
  },
});