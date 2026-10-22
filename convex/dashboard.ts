import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // 1. Sum up all Main Affiliate Earnings
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let affiliateTotalEarnings = 0;
    let affiliateEarnings = 0;
    let agentBonus = 0;

    for (const e of earnings) {
      affiliateTotalEarnings += e.amount;
      
      if (["level_1", "level_2", "level_3"].includes(e.source)) {
        affiliateEarnings += e.amount;
      }
      if (e.source === "agent_bonus") {
        agentBonus += e.amount;
      }
    }

    // 2. Sum up all Main Withdrawals & Deductions
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let withdrawn = 0;
    let pendingWithdrawals = 0;

    for (const w of withdrawals) {
      if (w.status === "approved") withdrawn += w.amount;
      if (w.status === "pending") pendingWithdrawals += w.amount; 
    }

    // 3. Calculate Live Main Balance (STRICTLY AFFILIATE - SAFE)
    const balance = affiliateTotalEarnings - withdrawn - pendingWithdrawals;

    // 4. Fetch the initial activation expense for display
    let expense = 0;
    if (user.country) {
      const price = await ctx.db
        .query("membershipPrices")
        .withIndex("by_country", (q) => q.eq("country", user.country!))
        .first();
      if (price) expense = price.amount;
    }

    // 5. Calculate Referral Stats & 7-Day Chart Data
    const downlines = await ctx.db
      .query("users")
      .withIndex("by_invitedBy", (q) => q.eq("invitedBy", userId))
      .collect();

    const oneDayMs = 24 * 60 * 60 * 1000;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const startOfWeek = startOfToday - (6 * oneDayMs);

    const allTimeReferrals = downlines.length;
    const todayReferrals = downlines.filter(u => u._creationTime >= startOfToday).length;
    const thisWeekReferrals = downlines.filter(u => u._creationTime >= startOfWeek).length;

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfToday - (i * oneDayMs);
      const dayEnd = dayStart + oneDayMs;
      
      const dailyCount = downlines.filter(
        (u) => u._creationTime >= dayStart && u._creationTime < dayEnd
      ).length;

      chartData.push({
        day: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
        referrals: dailyCount,
      });
    }

    // 6. Calculate Isolated Service Balances
    const serviceEarningsDocs = await ctx.db
      .query("serviceEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const serviceWithdrawalsDocs = await ctx.db
      .query("serviceWithdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const serviceBalances = {
      chat: 0,
      ads: 0,
      tiktok: 0,
      youtube: 0,
      survey: 0,
      blog: 0,
      hotel_review: 0,
    };

    let totalServiceEarnings = 0; 

    for (const e of serviceEarningsDocs) {
      if (e.source in serviceBalances) {
        serviceBalances[e.source as keyof typeof serviceBalances] += e.amount;
        totalServiceEarnings += e.amount; 
      }
    }

    for (const w of serviceWithdrawalsDocs) {
      if (w.status !== "rejected" && w.service in serviceBalances) {
        serviceBalances[w.service as keyof typeof serviceBalances] -= w.amount;
      }
    }

    // 7. NEW: Calculate Exact Minimum Withdrawal for this user's currency
    let serviceMinWithdrawal = 5000;
    const userCurrency = user.currency || "KES";
    if (userCurrency !== "KES") {
      const allRates = await ctx.db.query("exchangeRates").collect();
      const rateDoc = allRates.find((r) => r.currency?.trim().toUpperCase() === userCurrency.toUpperCase());
      if (rateDoc) {
        const rate = typeof rateDoc.rateToKES === 'string' ? parseFloat(rateDoc.rateToKES) : rateDoc.rateToKES;
        if (!isNaN(rate) && rate > 0) serviceMinWithdrawal = Math.round(5000 * rate);
      }
    }

    return {
      username: user.username ?? user.name ?? "Member",
      currency: userCurrency,
      
      // Grand Total Earnings (Affiliate + All Services combined for UI)
      totalEarnings: affiliateTotalEarnings + totalServiceEarnings, 
      
      affiliateEarnings,
      agentBonus,
      withdrawn,
      balance, 
      expense,
      referralStats: {
        allTime: allTimeReferrals,
        today: todayReferrals,
        thisWeek: thisWeekReferrals,
        chartData,
      },
      serviceBalances,
      serviceMinWithdrawal, // <-- Passing the exact number to the frontend
    };
  },
});