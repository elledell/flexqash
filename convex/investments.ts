import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Fetch all available packages for the storefront
export const getPackages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("investmentPackages")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Fetch a user's active and past investments
export const getUserInvestments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const investments = await ctx.db
      .query("activeInvestments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Attach package details to each investment for the UI
    return Promise.all(
      investments.map(async (inv) => {
        const pkg = await ctx.db.get(inv.packageId);
        return { ...inv, packageName: pkg?.name || "Unknown Package" };
      })
    );
  },
});

// Purchase a package using main balance
export const purchasePackage = mutation({
  args: { packageId: v.id("investmentPackages") },
  handler: async (ctx, { packageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    const pkg = await ctx.db.get(packageId);
    if (!pkg || !pkg.isActive) throw new ConvexError("Package is unavailable");

    // 1. Calculate Main Affiliate Balance
    const earnings = await ctx.db.query("earnings").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const withdrawals = await ctx.db.query("withdrawals").withIndex("by_user", (q) => q.eq("userId", userId)).collect();

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const withdrawn = withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
    const pendingWith = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);

    const mainBalance = totalEarnings - withdrawn - pendingWith;

    // Cross-border currency conversion for the cost
    const userCurrency = user.currency || "KES";
    let costInUserCurrency = pkg.cost;

    if (userCurrency !== "KES") {
      const allRates = await ctx.db.query("exchangeRates").collect();
      const rateDoc = allRates.find((r) => r.currency?.trim().toUpperCase() === userCurrency.toUpperCase());
      if (rateDoc) {
        const rate = typeof rateDoc.rateToKES === 'string' ? parseFloat(rateDoc.rateToKES) : rateDoc.rateToKES;
        if (!isNaN(rate) && rate > 0) costInUserCurrency = Math.round(pkg.cost * rate);
      }
    }

    // 2. Enforce Balance Check
    if (mainBalance < costInUserCurrency) {
      throw new ConvexError({
        code: "INSUFFICIENT_FUNDS",
        shortfall: costInUserCurrency - mainBalance,
        currency: userCurrency,
        message: `Insufficient balance to buy ${pkg.name}.`
      });
    }

    // 3. Deduct from Main Balance (Internal Transfer)
    await ctx.db.insert("withdrawals", {
      userId: userId,
      amount: costInUserCurrency,
      fee: 0,
      netAmount: costInUserCurrency,
      currency: userCurrency,
      method: "investment_purchase",
      paymentDetails: `Purchased ${pkg.name}`,
      status: "approved",
      processedAt: Date.now(),
    });

    // 4. Activate the Investment
    const dailyPayout = Math.round(pkg.cost * (pkg.dailyRoi / 100));
    const durationMs = pkg.durationDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    await ctx.db.insert("activeInvestments", {
      userId: userId,
      packageId: pkg._id,
      investedAmount: pkg.cost, // Base KES/Coins
      dailyPayoutAmount: dailyPayout,
      startDate: now,
      endDate: now + durationMs,
      lastPayoutDate: now, // Starts today, pays out tomorrow
      status: "active",
    });

    return { success: true, message: `Successfully purchased ${pkg.name}!` };
  },
});