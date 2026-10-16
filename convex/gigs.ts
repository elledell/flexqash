import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Fetch the user's active gig applications
export const getUserApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("gigApplications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Process the gig bid using the main dashboard balance
export const applyForGig = mutation({
  args: { 
    gigId: v.string(),
    bidCostKES: v.number(), // Default cost in KES
    gigName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    // 1. Prevent duplicate applications
    const existing = await ctx.db
      .query("gigApplications")
      .withIndex("by_user_gig", (q) => q.eq("userId", userId).eq("gigId", args.gigId))
      .first();
      
    if (existing) {
      throw new ConvexError("You have already applied for this gig.");
    }

    // 2. Calculate Main Affiliate Balance
    const earnings = await ctx.db.query("earnings").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const withdrawals = await ctx.db.query("withdrawals").withIndex("by_user", (q) => q.eq("userId", userId)).collect();

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const withdrawn = withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
    const pendingWith = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);

    const mainBalance = totalEarnings - withdrawn - pendingWith;

    // 3. Currency Conversion for Bidding Fee
    const userCurrency = user.currency || "KES";
    let costInUserCurrency = args.bidCostKES;

    if (userCurrency !== "KES") {
      const allRates = await ctx.db.query("exchangeRates").collect();
      const rateDoc = allRates.find((r) => r.currency?.trim().toUpperCase() === userCurrency.toUpperCase());
      if (rateDoc) {
        const rate = typeof rateDoc.rateToKES === 'string' ? parseFloat(rateDoc.rateToKES) : rateDoc.rateToKES;
        if (!isNaN(rate) && rate > 0) costInUserCurrency = Math.round(args.bidCostKES * rate);
      }
    }

    // 4. Enforce Balance Check (Throw shortfall error if funds are low)
    if (mainBalance < costInUserCurrency) {
      throw new ConvexError({
        code: "INSUFFICIENT_FUNDS",
        shortfall: costInUserCurrency - mainBalance,
        currency: userCurrency,
        message: `Insufficient balance to apply for ${args.gigName}.`
      });
    }

    // 5. Deduct Bidding Fee (Internal Withdrawal)
    await ctx.db.insert("withdrawals", {
      userId: userId,
      amount: costInUserCurrency,
      fee: 0,
      netAmount: costInUserCurrency,
      currency: userCurrency,
      method: "gig_bidding_fee",
      paymentDetails: `Bid for ${args.gigName}`,
      status: "approved",
      processedAt: Date.now(),
    });

    // 6. Record the Application
    await ctx.db.insert("gigApplications", {
      userId,
      gigId: args.gigId,
      bidCost: costInUserCurrency,
      status: "pending",
      appliedAt: Date.now(),
    });

    return { success: true, message: `Successfully applied for ${args.gigName}! We will notify you if selected.` };
  },
});