import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin } from "./access";

const BASE_USD_COST = 10;

export const getForexData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Check if user has paid for Forex
    const membership = await ctx.db
      .query("forexMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Fetch the live meeting link
    const settings = await ctx.db.query("forexSettings").first();
    const meetingLink = settings?.meetingLink || "";

    // Convert $10 to user's currency for the sales pitch
    const userCurrency = user.currency || "KES";
    let localizedCost = 1300; // Fallback to 1300 KES

    const allRates = await ctx.db.query("exchangeRates").collect();
    const rateMap: Record<string, number> = { KES: 1 };
    for (const r of allRates) {
      if (r.currency) {
        rateMap[r.currency.trim().toUpperCase()] = typeof r.rateToKES === 'string' ? parseFloat(r.rateToKES) : r.rateToKES;
      }
    }

    const usdRate = rateMap["USD"];
    const targetRate = rateMap[userCurrency];

    if (usdRate && targetRate) {
      // Base logic: convert from USD to KES, then to Local Currency
      const costInKES = usdRate > 0 ? BASE_USD_COST / usdRate : BASE_USD_COST * 130; 
      localizedCost = Math.round(userCurrency === "KES" ? costInKES : costInKES * targetRate);
    }

    return {
      isMember: !!membership,
      meetingLink: membership ? meetingLink : null, // Hide link if not paid
      localizedCost,
      currency: userCurrency,
    };
  },
});

export const joinForexClass = mutation({
  args: { cost: v.number(), currency: v.string() },
  handler: async (ctx, { cost, currency }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const existing = await ctx.db
      .query("forexMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) throw new ConvexError("You are already a Forex member.");

    // 1. Calculate Main Affiliate Balance
    const earnings = await ctx.db.query("earnings").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const withdrawals = await ctx.db.query("withdrawals").withIndex("by_user", (q) => q.eq("userId", userId)).collect();

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const withdrawn = withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
    const pendingWith = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);

    const mainBalance = totalEarnings - withdrawn - pendingWith;

    // 2. Enforce Balance Check (Using the structured error from gigs.ts)
    if (mainBalance < cost) {
      throw new ConvexError({
        code: "INSUFFICIENT_FUNDS",
        shortfall: cost - mainBalance,
        currency: currency,
        message: `Insufficient balance to join the Forex Masterclass.`
      });
    }

    // 3. Deduct from Main Balance (Internal Transfer)
    await ctx.db.insert("withdrawals", {
      userId: userId,
      amount: cost,
      fee: 0,
      netAmount: cost,
      currency: currency,
      method: "forex_lesson_fee",
      paymentDetails: `Purchased Lifetime Forex Lessons`,
      status: "approved",
      processedAt: Date.now(),
    });

    // 4. Activate Forex Access
    await ctx.db.insert("forexMembers", {
      userId,
      amountPaid: cost,
      currency,
      joinedAt: Date.now(),
    });

    return { success: true, message: "Welcome to the Forex Masterclass!" };
  },
});

export const updateMeetingLink = mutation({
  args: { link: v.string() },
  handler: async (ctx, { link }) => {
    await requireAdmin(ctx);
    const userId = await getAuthUserId(ctx);

    const settings = await ctx.db.query("forexSettings").first();
    if (settings) {
      await ctx.db.patch(settings._id, { meetingLink: link, updatedAt: Date.now(), updatedBy: userId || undefined });
    } else {
      await ctx.db.insert("forexSettings", { meetingLink: link, updatedAt: Date.now(), updatedBy: userId || undefined });
    }
    return { success: true };
  }
});