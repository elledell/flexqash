import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./access";

export const getOverview = query({
  args: { countryCode: v.string() },
  handler: async (ctx, { countryCode }) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("users").collect();
    const filteredUsers = countryCode === "ALL" 
      ? allUsers 
      : allUsers.filter(u => u.country === countryCode);
      
    const userIds = new Set(filteredUsers.map(u => u._id));

    // 1. Fetch Exchange Rates for Currency Normalization
    const allRates = await ctx.db.query("exchangeRates").collect();
    const rateMap: Record<string, number> = { KES: 1 };
    for (const r of allRates) {
      rateMap[r.currency] = r.rateToKES;
    }

    // Helper to normalize foreign currencies to KES
    const convertToKES = (amount: number, currency: string) => {
      if (currency === "KES") return amount;
      const rate = rateMap[currency];
      if (!rate) return amount; // Fallback if rate is missing
      return amount / rate;
    };

    // 2. Fetch the 500 most recent payments for stats
    const allPayments = await ctx.db.query("payments").order("desc").take(500);
    const filteredPayments = allPayments.filter(p => userIds.has(p.userId) && p.status === "paid" && p.purpose === "deposit");
    
    // Normalize and sum total deposits
    const totalDeposits = filteredPayments.reduce((sum, p) => sum + convertToKES(p.amount, p.currency || "KES"), 0);

    const activity = allPayments
      .filter(p => userIds.has(p.userId))
      .slice(0, 10)
      .map(p => {
         const u = filteredUsers.find(user => user._id === p.userId);
         return {
           _id: p._id,
           phone: p.phone,
           type: p.purpose || "membership",
           amount: p.amount,
           currency: p.currency,
           countryCode: u?.country || "KE",
           status: p.status,
           time: p._creationTime
         };
      });

    // 3. DYNAMIC GRAPH DATA: Calculate stats for the last 7 days
    const now = new Date();
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = d.getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

      const dailyUsers = filteredUsers.filter(u => u._creationTime >= startOfDay && u._creationTime <= endOfDay).length;
      
      // Normalize daily deposits to KES before adding to the chart
      const dailyDeposits = filteredPayments
        .filter(p => p._creationTime >= startOfDay && p._creationTime <= endOfDay)
        .reduce((sum, p) => sum + convertToKES(p.amount, p.currency || "KES"), 0);

      chartData.push({ 
        name: label, 
        fullDate,
        users: dailyUsers, 
        deposits: Math.round(dailyDeposits) 
      });
    }

    return {
      totalUsers: filteredUsers.length,
      totalDeposits: Math.round(totalDeposits),
      transactionCount: filteredPayments.length,
      recentActivity: activity,
      chartData 
    };
  },
});