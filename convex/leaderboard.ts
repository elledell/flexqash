import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getWeeklyRanks = query({
  args: {},
  handler: async (ctx) => {
    // Calculate the timestamp for exactly 7 days ago
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Fetch ONLY users who are active AND paid within the last 7 days
    const recentActiveUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("membership"), "active"),
          q.gte(q.field("membershipPaidAt"), oneWeekAgo)
        )
      )
      .collect();

    // Group and count the referrals by sponsor
    const counts = new Map<string, number>();
    for (const user of recentActiveUsers) {
      if (user.invitedBy) {
        counts.set(user.invitedBy, (counts.get(user.invitedBy) || 0) + 1);
      }
    }

    // Resolve the sponsor IDs into Usernames
    const leaderboard = [];
    for (const [sponsorId, count] of counts.entries()) {
      const sponsor = await ctx.db.get(sponsorId as Id<"users">);
      
      // Exclude admins from the leaderboard so regular members have a fair chance
      if (sponsor && sponsor.role !== "admin") {
        leaderboard.push({
          username: sponsor.username || sponsor.name || "Anonymous",
          count,
        });
      }
    }

    // Sort from highest referrals to lowest
    leaderboard.sort((a, b) => b.count - a.count);

    // Return the Top 10
    return leaderboard.slice(0, 10);
  },
});