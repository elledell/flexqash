import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
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
    if (amount <= 0) throw new ConvexError("Invalid deposit amount.");

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