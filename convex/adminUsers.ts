import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./access";

export const listUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, { searchTerm }) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("users").order("desc").collect();

    // 1. Calculate Statistics
    const totalUsers = allUsers.length;
    const activatedUsers = allUsers.filter(u => u.membership === "active").length;
    
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeThisWeek = allUsers.filter(u => u._creationTime > oneWeekAgo).length;
    
    const activationRate = totalUsers > 0 ? Math.round((activatedUsers / totalUsers) * 100) : 0;

    // 2. Filter by Search Term
    let displayUsers = allUsers;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      displayUsers = allUsers.filter(u => 
        (u.email || "").toLowerCase().includes(lower) || 
        (u.username || "").toLowerCase().includes(lower) ||
        (u.name || "").toLowerCase().includes(lower)
      );
    }

    // 3. Limit to top 100 for table performance
    displayUsers = displayUsers.slice(0, 100);

    // 4. Fetch Earnings for Displayed Users
    const items = await Promise.all(displayUsers.map(async (u) => {
      const earnings = await ctx.db
        .query("earnings")
        .withIndex("by_user", (q) => q.eq("userId", u._id))
        .collect();
      
      const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);

      return {
        _id: u._id,
        email: u.email || u.username || "No Email",
        country: u.country || "KE",
        currency: u.currency || "KES",
        totalEarned,
        joined: u._creationTime,
        status: u.membership === "active" ? "Activated" : "Pending",
      };
    }));

    return {
      stats: {
        totalUsers,
        activatedUsers,
        activeThisWeek,
        activationRate
      },
      items,
    };
  }
});
export const getUserNetwork = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // 1. Find the Uplink (Who invited this user?)
    let upline = null;
    if (user.invitedBy) {
      const parent = await ctx.db.get(user.invitedBy);
      if (parent) {
        upline = {
          name: parent.username || parent.name || "Unknown",
          country: parent.country || "KE",
          status: parent.membership,
        };
      }
    }

    // 2. Find the Downline (Who did this user invite?)
    const downlineDocs = await ctx.db
      .query("users")
      .withIndex("by_invitedBy", (q) => q.eq("invitedBy", userId))
      .collect();

    const downline = downlineDocs.map((d) => ({
      name: d.username || d.name || "Unknown",
      country: d.country || "KE",
      status: d.membership,
      joinedAt: d._creationTime,
    }));

    return {
      upline,
      downline,
      totalReferred: downline.length,
      activeReferred: downline.filter((d) => d.status === "active").length,
    };
  },
});