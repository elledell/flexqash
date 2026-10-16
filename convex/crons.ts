import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Use internalMutation so it cannot be triggered directly from the frontend
export const processDailyInvestments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeInvestments = await ctx.db
      .query("activeInvestments")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    for (const inv of activeInvestments) {
      // Check if package has expired
      if (now >= inv.endDate) {
        await ctx.db.patch(inv._id, { status: "completed" });
        continue;
      }

      // Check if 24 hours have passed since the last payout
      const msSinceLastPayout = now - inv.lastPayoutDate;
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (msSinceLastPayout >= oneDayMs) {
        // Drop the coins into the isolated service ledger
        await ctx.db.insert("serviceEarnings", {
          userId: inv.userId,
          amount: inv.dailyPayoutAmount,
          source: "investment",
        });

        // Update the tracker
        await ctx.db.patch(inv._id, {
          lastPayoutDate: now,
        });
      }
    }
  },
});

const crons = cronJobs();

// 21:00 UTC is exactly Midnight (00:00) East African Time (EAT)
crons.daily(
  "Distribute Daily Investment ROI",
  { hourUTC: 21, minuteUTC: 0 },
  internal.crons.processDailyInvestments
);

export default crons;