import { v, ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitManualDeposit = mutation({
  args: {
    methodTitle: v.string(),
    phone: v.string(),
    amount: v.number(),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, { methodTitle, phone, amount, transactionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Please sign in.");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Account not found.");
    if (amount < 100) throw new ConvexError("Minimum deposit is 100.");

    const paymentId = await ctx.db.insert("payments", {
      userId,
      purpose: "deposit",
      provider: "manual",
      amount,
      currency: user.currency ?? "KES",
      phone,
      methodTitle,
      transactionId,
      status: "pending",
      resultDesc: "Deposit pending admin approval",
    });

    return { paymentId };
  },
});

export const getUserDeposits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("purpose"), "deposit"))
      .order("desc")
      .take(20);
  },
});

// Helper: Create pending automated M-Pesa deposit
export const createPendingMpesaDeposit = internalMutation({
  args: {
    userId: v.id("users"),
    phone: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { userId, phone, amount }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Account not found.");
    if (amount < 100) throw new ConvexError("Minimum deposit is 100 KES.");

    const paymentId = await ctx.db.insert("payments", {
      userId,
      purpose: "deposit",
      provider: "mpesa",
      amount,
      currency: user.currency ?? "KES",
      phone,
      methodTitle: "M-Pesa Express Deposit",
      status: "pending",
    });

    return { paymentId, amount };
  },
});

// Helper: Attach Daraja identifiers to deposit record
export const attachDepositCheckout = internalMutation({
  args: {
    paymentId: v.id("payments"),
    checkoutRequestId: v.string(),
    merchantRequestId: v.string(),
  },
  handler: async (ctx, { paymentId, checkoutRequestId, merchantRequestId }) => {
    await ctx.db.patch(paymentId, { checkoutRequestId, merchantRequestId });
  },
});