import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      name: user.name,
      username: user.username, // Added this so the frontend can read it
      email: user.email,
      country: user.country,
      currency: user.currency,
      role: user.role ?? "member",
      membershipActive: user.membership === "active",
    };
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const user = await ctx.db.get(userId);
    if (!user) return null;

    let inviterUsername = "None";
    if (user.invitedBy) {
      const inviter = await ctx.db.get(user.invitedBy);
      if (inviter) {
        inviterUsername = inviter.username || inviter.name || "Unknown";
      }
    }

    return {
      name: user.name || "N/A",
      username: user.username || "N/A",
      email: user.email || "N/A",
      phone: user.phone || "N/A",
      country: user.country || "N/A",
      invitedBy: inviterUsername,
      status: user.membership === "active" ? "Active" : "Inactive",
      joinDate: user._creationTime,
    };
  },
});