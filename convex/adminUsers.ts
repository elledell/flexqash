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
        isBanned: !!u.isBanned,
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

    // 1. Find the Uplink
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

    // 2. Find the Downline
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

export const toggleActivation = mutation({
  args: { 
    userId: v.id("users"), 
    status: v.union(v.literal("active"), v.literal("none")) 
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { 
      membership: args.status,
      ...(args.status === "active" ? { membershipPaidAt: Date.now() } : {})
    });
    return { success: true };
  }
});

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

export const approveUserManually = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found");
    if (user.membership === "active") throw new ConvexError("User is already activated.");

    await ctx.db.patch(args.userId, { 
      membership: "active",
      membershipPaidAt: Date.now() 
    });

    const pendingPayments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    if (pendingPayments.length > 0) {
      for (const payment of pendingPayments) {
        await ctx.db.patch(payment._id, { 
          status: "paid", 
          resultDesc: "Manually approved by Admin via Users table" 
        });
      }
    } else {
      const countryCode = user.country || "KE";
      const priceDoc = await ctx.db
        .query("membershipPrices")
        .withIndex("by_country", (q) => q.eq("country", countryCode))
        .first();
      
      await ctx.db.insert("payments", {
        userId: args.userId,
        purpose: "deposit",
        provider: "manual",
        amount: priceDoc ? priceDoc.amount : 0,
        currency: user.currency || "KES",
        phone: "Admin-Bypass",
        methodTitle: "Direct Admin Activation",
        status: "paid",
        resultDesc: "Auto-generated during manual admin activation",
      });
    }

    await distributeCommissions(ctx, args.userId);

    return { success: true };
  }
});

export const updateUplink = mutation({
  args: {
    userId: v.id("users"),
    newUplineUsername: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const cleanUsername = args.newUplineUsername.trim().toLowerCase();
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new ConvexError("User not found.");

    // 1. CLAWBACK: Delete existing earnings generated by this user
    const oldEarnings = await ctx.db
      .query("earnings")
      .filter((q) => q.eq(q.field("fromUserId"), args.userId))
      .collect();

    for (const earning of oldEarnings) {
      await ctx.db.delete(earning._id);
    }

    // 2. Remove sponsor if input is empty
    if (!cleanUsername) {
      await ctx.db.patch(args.userId, { invitedBy: undefined });
      return { success: true };
    }

    // 3. Set the new sponsor
    const allUsers = await ctx.db.query("users").collect();
    const newUpline = allUsers.find((u) => (u.username || "").toLowerCase() === cleanUsername);

    if (!newUpline) {
      throw new ConvexError(`We could not find any user with the username '${args.newUplineUsername}'.`);
    }

    if (newUpline._id === args.userId) {
      throw new ConvexError("A user cannot be their own sponsor.");
    }

    await ctx.db.patch(args.userId, { invitedBy: newUpline._id });

    // 4. REDISTRIBUTE: Pay the new upline tree if the user is already active
    if (targetUser.membership === "active") {
      await distributeCommissions(ctx, args.userId);
    }

    return { success: true };
  }
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // 1. CLAWBACK: Delete earnings generated BY this user to prevent platform losses
    const generatedEarnings = await ctx.db
      .query("earnings")
      .filter((q) => q.eq(q.field("fromUserId"), args.userId))
      .collect();

    for (const earning of generatedEarnings) {
      await ctx.db.delete(earning._id);
    }
    
    // 2. Clear Auth Accounts (Frees up the email)
    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    // 3. Clear Active Sessions
    const authSessions = await ctx.db
      .query("authSessions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }
    
    // 4. Delete the primary user record
    await ctx.db.delete(args.userId);
    
    return { success: true };
  }
});