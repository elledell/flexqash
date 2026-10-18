import { v, ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const requestServiceWithdrawal = mutation({
  args: {
    serviceKey: v.string(), // e.g., "hotel_review", "chat"
    amount: v.number(),
    phone: v.string(),
  },
  handler: async (ctx, { serviceKey, amount, phone }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Please sign in.");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found.");

    // 1. Calculate the 5,000 KES equivalent in the user's local currency
    let minAmount = 5000;
    const userCurrency = user.currency || "KES";
    
    if (userCurrency !== "KES") {
      const allRates = await ctx.db.query("exchangeRates").collect();
      const rateDoc = allRates.find((r) => r.currency?.trim().toUpperCase() === userCurrency.toUpperCase());
      if (rateDoc) {
        const rate = typeof rateDoc.rateToKES === 'string' ? parseFloat(rateDoc.rateToKES) : rateDoc.rateToKES;
        if (!isNaN(rate) && rate > 0) minAmount = Math.round(5000 * rate);
      }
    }

    if (amount < minAmount) {
      throw new ConvexError(`Minimum withdrawal is ${userCurrency} ${minAmount.toLocaleString()}`);
    }

    // 2. Calculate balance for THIS specific gamified service
    const earnings = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user_source", q => q.eq("userId", userId).eq("source", serviceKey as any))
      .collect();

    const withdrawals = await ctx.db
      .query("serviceWithdrawals")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.neq(q.field("status"), "rejected"))
      .filter(q => q.eq(q.field("service"), serviceKey))
      .collect();

    const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalEarned - totalWithdrawn;

    if (amount > availableBalance) {
      throw new ConvexError(`Insufficient ${serviceKey} balance.`);
    }

    // 3. Log into the isolated table (Invisible to Main Affiliate Withdrawals)
    await ctx.db.insert("serviceWithdrawals", {
      userId,
      amount,
      service: serviceKey,
      status: "pending",
      requestedAt: Date.now(),
    });

    return { success: true, message: `Withdrawal request for ${userCurrency} ${amount} submitted successfully!` };
  }
});