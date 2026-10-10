import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./access";

export const getRates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exchangeRates").collect();
  },
});

export const setRate = mutation({
  args: {
    currency: v.string(),
    rateToKES: v.number(),
  },
  handler: async (ctx, { currency, rateToKES }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("exchangeRates")
      .withIndex("by_currency", (q) => q.eq("currency", currency))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { rateToKES, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("exchangeRates", { currency, rateToKES, updatedAt: Date.now() });
    }
    return { success: true };
  },
});