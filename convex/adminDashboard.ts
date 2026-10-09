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

    // Fetch the 500 most recent payments for stats
    const allPayments = await ctx.db.query("payments").order("desc").take(500);
    const filteredPayments = allPayments.filter(p => userIds.has(p.userId) && p.status === "paid" && p.purpose === "deposit");
    
    const totalDeposits = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

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

    return {
      totalUsers: filteredUsers.length,
      totalDeposits,
      transactionCount: filteredPayments.length,
      recentActivity: activity
    };
  },
});