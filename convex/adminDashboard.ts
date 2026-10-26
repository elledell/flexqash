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

    // Fetch Exchange Rates
    const allRates = await ctx.db.query("exchangeRates").collect();
    const rateMap: Record<string, number> = { KES: 1 };
    for (const r of allRates) {
      rateMap[r.currency] = typeof r.rateToKES === 'string' ? parseFloat(r.rateToKES) : r.rateToKES;
    }

    const convertToKES = (amount: number, currency: string) => {
      if (currency === "KES") return amount;
      const rate = rateMap[currency];
      if (!rate) return amount; 
      return amount / rate;
    };

    const allPayments = await ctx.db.query("payments").order("desc").collect();
    
    // FIX 1: Removed `&& p.purpose === "deposit"` so it perfectly matches the Finance Analytics page
    const filteredPayments = allPayments.filter(p => userIds.has(p.userId) && p.status === "paid");
    
    // FIX 2: Only normalize to KES if viewing "All Countries". Otherwise, show exact native currency.
    const totalDeposits = filteredPayments.reduce((sum, p) => {
      return sum + (countryCode === "ALL" ? convertToKES(p.amount, p.currency || "KES") : p.amount);
    }, 0);

    // Allow ALL statuses to show in the recent activity list, but not in the math
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

    const now = new Date();
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = d.getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

      const dailyUsers = filteredUsers.filter(u => u._creationTime >= startOfDay && u._creationTime <= endOfDay).length;
      
      // FIX 2 Applied to chart: Native currency for specific countries, KES for "ALL"
      const dailyDeposits = filteredPayments
        .filter(p => p._creationTime >= startOfDay && p._creationTime <= endOfDay)
        .reduce((sum, p) => {
          return sum + (countryCode === "ALL" ? convertToKES(p.amount, p.currency || "KES") : p.amount);
        }, 0);

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