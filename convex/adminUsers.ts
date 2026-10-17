import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./access";
import { distributeCommissions } from "./affiliate";

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
        isBanned: !!u.isBanned, // Passes the ban status to the frontend UI
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

// Toggle a user's membership (Activate / Deactivate) without paying commissions
export const toggleActivation = mutation({
  args: { 
    userId: v.id("users"), 
    status: v.union(v.literal("active"), v.literal("none")) 
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx); // Ensure only admins can do this
    await ctx.db.patch(args.userId, { 
      membership: args.status,
      // If we are activating them, record the timestamp
      ...(args.status === "active" ? { membershipPaidAt: Date.now() } : {})
    });
    return { success: true };
  }
});

// Toggle a user's ban status (Ban / Unban)
export const toggleBan = mutation({
  args: { 
    userId: v.id("users"), 
    isBanned: v.boolean() 
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isBanned: args.isBanned });
    return { success: true };
  }
});

// Full Manual Approval (Activates, Clears Requests, and Pays Uplines)
export const approveUserManually = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found");
    if (user.membership === "active") throw new ConvexError("User is already activated.");

    // 1. Activate the user
    await ctx.db.patch(args.userId, { 
      membership: "active",
      membershipPaidAt: Date.now() 
    });

    // 2. Find any pending manual payment requests and mark them as paid
    const pendingPayments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    for (const payment of pendingPayments) {
      await ctx.db.patch(payment._id, { 
        status: "paid", 
        resultDesc: "Manually approved by Admin via Users table" 
      });
    }

    // 3. Fire the commission engine to pay Level 1, 2, and 3
    await distributeCommissions(ctx, args.userId);

    return { success: true };
  }
});