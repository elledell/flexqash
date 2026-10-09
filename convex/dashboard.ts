import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // 1. Sum up all Earnings
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let totalEarnings = 0;
    let affiliateEarnings = 0;
    let agentBonus = 0;

    for (const e of earnings) {
      totalEarnings += e.amount;
      
      if (["level_1", "level_2", "level_3"].includes(e.source)) {
        affiliateEarnings += e.amount;
      }
      if (e.source === "agent_bonus") {
        agentBonus += e.amount;
      }
    }

    // 2. Sum up all Withdrawals
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let withdrawn = 0;
    let pendingWithdrawals = 0;

    for (const w of withdrawals) {
      if (w.status === "approved") withdrawn += w.amount;
      if (w.status === "pending") pendingWithdrawals += w.amount; // Lock pending funds from balance
    }

    // 3. Calculate Live Balance
    const balance = totalEarnings - withdrawn - pendingWithdrawals;

    // 4. Fetch the initial activation expense for display
    let expense = 0;
    if (user.country) {
      const price = await ctx.db
        .query("membershipPrices")
        .withIndex("by_country", (q) => q.eq("country", user.country!))
        .first();
      if (price) expense = price.amount;
    }

    return {
      username: user.username ?? user.name ?? "Member",
      currency: user.currency ?? "KES",
      totalEarnings,
      affiliateEarnings,
      agentBonus,
      withdrawn,
      balance,
      expense,
    };
  },
});