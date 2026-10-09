import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTeam = query({
  args: {
    level: v.number(),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, { level, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Fetch Level 1 (Direct Invites)
    const level1 = await ctx.db
      .query("users")
      .withIndex("by_invitedBy", (q) => q.eq("invitedBy", userId))
      .collect();

    let targetUsers = level1;

    // Fetch Level 2 (Invited by Level 1)
    if (level >= 2) {
      const level2 = [];
      for (const u of level1) {
        const downlines = await ctx.db
          .query("users")
          .withIndex("by_invitedBy", (q) => q.eq("invitedBy", u._id))
          .collect();
        level2.push(...downlines);
      }
      targetUsers = level2;
    }

    // Fetch Level 3 (Invited by Level 2)
    if (level === 3) {
      const level3 = [];
      for (const u of targetUsers) {
        const downlines = await ctx.db
          .query("users")
          .withIndex("by_invitedBy", (q) => q.eq("invitedBy", u._id))
          .collect();
        level3.push(...downlines);
      }
      targetUsers = level3;
    }

    // Filter by Active/Inactive
    if (status === "active") {
      targetUsers = targetUsers.filter((u) => u.membership === "active");
    } else if (status === "inactive") {
      targetUsers = targetUsers.filter((u) => u.membership !== "active");
    }

    // Map the results and fetch their total contribution to the current user
    const result = [];
    for (const u of targetUsers) {
      // Look up how much this user has paid up to the current user
      const earnings = await ctx.db
        .query("earnings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("fromUserId"), u._id))
        .collect();
      
      const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);

      result.push({
        _id: u._id,
        username: u.username || u.name || "Unknown",
        mobile: u.phone || "N/A",
        country: u.country || "KE",
        status: u.membership === "active" ? "Active" : "Inactive",
        dateOfReg: u._creationTime,
        earned: totalEarned,
      });
    }

    // Sort by newest registered first
    return result.sort((a, b) => b.dateOfReg - a.dateOfReg);
  },
});