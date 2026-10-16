import { v, ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { distributeCommissions } from "./affiliate"; // Matches your current commission file

export const activateUserWithBalance = mutation({
  args: { targetUsername: v.string() },
  handler: async (ctx, { targetUsername }) => {
    const payerId = await getAuthUserId(ctx);
    if (!payerId) throw new ConvexError("Not authenticated");

    const payer = await ctx.db.get(payerId);
    if (!payer) throw new ConvexError("Account not found");

    // 1. Locate the Target Client
    const cleanUsername = targetUsername.trim().toLowerCase();
    let targetUser = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", cleanUsername))
      .first();

    // Fallback for mixed-case usernames from older registrations
    if (!targetUser) {
      const allUsers = await ctx.db.query("users").collect();
      targetUser = allUsers.find((u) => (u.username || "").toLowerCase() === cleanUsername) ?? null;
    }

    // 2. Strict Validations
    if (!targetUser) {
      throw new ConvexError("This username does not exist.");
    }
    if (targetUser.membership === "active") {
      throw new ConvexError("This user is already active.");
    }
    if (targetUser._id === payerId) {
      throw new ConvexError("You cannot use this feature to pay for yourself.");
    }

    // 3. Determine the Cost & Convert to Payer's Currency
    const targetCountry = targetUser.country || "KE";
    const targetPriceDoc = await ctx.db
      .query("membershipPrices")
      .withIndex("by_country", (q) => q.eq("country", targetCountry))
      .first();

    if (!targetPriceDoc) {
      throw new ConvexError(`Activation fee for ${targetCountry} is not set by admin.`);
    }

    const targetFee = targetPriceDoc.amount;
    const targetCurrency = targetPriceDoc.currency;
    const payerCurrency = payer.currency || "KES";

    let costInPayerCurrency = targetFee;

    // Cross-border conversion logic
    if (targetCurrency !== payerCurrency) {
      const allRates = await ctx.db.query("exchangeRates").collect();
      const rateMap: Record<string, number> = { KES: 1 };
      
      for (const r of allRates) {
        if (r.currency) {
          rateMap[r.currency.trim().toUpperCase()] = typeof r.rateToKES === 'string' ? parseFloat(r.rateToKES) : r.rateToKES;
        }
      }

      const fromRate = rateMap[targetCurrency.toUpperCase()];
      const toRate = rateMap[payerCurrency.toUpperCase()];

      if (!fromRate || !toRate) {
        throw new ConvexError("Exchange rates not configured for this cross-border transaction.");
      }

      const feeInKES = targetCurrency === "KES" ? targetFee : targetFee / fromRate;
      costInPayerCurrency = Math.round(payerCurrency === "KES" ? feeInKES : feeInKES * toRate);
    }

    // 4. Calculate Payer's Available Balance
    const earnings = await ctx.db.query("earnings").withIndex("by_user", (q) => q.eq("userId", payerId)).collect();
    const withdrawals = await ctx.db.query("withdrawals").withIndex("by_user", (q) => q.eq("userId", payerId)).collect();

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const withdrawn = withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
    const pendingWith = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);

    const balance = totalEarnings - withdrawn - pendingWith;

    if (balance < costInPayerCurrency) {
      throw new ConvexError(`Insufficient balance. You need ${payerCurrency} ${costInPayerCurrency.toLocaleString()} to activate this user.`);
    }

    // 5. Deduct Balance (Logged as an approved withdrawal to correctly sync with dashboard logic)
    // 5. Deduct Balance (Logged as an approved withdrawal to correctly sync with dashboard logic)
   // 5. Deduct Balance (Logged as an approved withdrawal to correctly sync with dashboard logic)
    await ctx.db.insert("withdrawals", {
      userId: payerId,
      amount: costInPayerCurrency,
      fee: 0,
      netAmount: costInPayerCurrency,
      currency: payerCurrency,
      method: "wallet_transfer",
      paymentDetails: `Paid activation for client: @${targetUser.username}`,
      status: "approved",
      processedAt: Date.now(),
    });

    // 6. Activate Client & Distribute Commissions
    await ctx.db.patch(targetUser._id, {
      membership: "active",
      membershipPaidAt: Date.now(),
    });

    await distributeCommissions(ctx, targetUser._id);

    return { 
      success: true, 
      targetUsername: targetUser.username, 
      cost: costInPayerCurrency, 
      currency: payerCurrency 
    };
  },
});