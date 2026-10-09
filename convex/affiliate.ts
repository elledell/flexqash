import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { COUNTRY_FINANCIALS } from "./financials";

export async function distributeCommissions(ctx: MutationCtx, newlyActiveUserId: Id<"users">) {
  const newMember = await ctx.db.get(newlyActiveUserId);
  if (!newMember || !newMember.invitedBy) return; // No upline to pay

  // LEVEL 1 Payout
  const level1Sponsor = await ctx.db.get(newMember.invitedBy);
  if (!level1Sponsor || level1Sponsor.membership !== "active") return;

  const l1Financials = COUNTRY_FINANCIALS[level1Sponsor.country ?? "INTL"];
  if (l1Financials && l1Financials.l1 > 0) {
    await ctx.db.insert("earnings", {
      userId: level1Sponsor._id,
      amount: l1Financials.l1,
      currency: l1Financials.currency,
      source: "level_1",
      fromUserId: newlyActiveUserId,
    });
  }

  if (!level1Sponsor.invitedBy) return;

  // LEVEL 2 Payout
  const level2Sponsor = await ctx.db.get(level1Sponsor.invitedBy);
  if (!level2Sponsor || level2Sponsor.membership !== "active") return;

  const l2Financials = COUNTRY_FINANCIALS[level2Sponsor.country ?? "INTL"];
  if (l2Financials && l2Financials.l2 > 0) {
    await ctx.db.insert("earnings", {
      userId: level2Sponsor._id,
      amount: l2Financials.l2,
      currency: l2Financials.currency,
      source: "level_2",
      fromUserId: newlyActiveUserId,
    });
  }

  if (!level2Sponsor.invitedBy) return;

  // LEVEL 3 Payout
  const level3Sponsor = await ctx.db.get(level2Sponsor.invitedBy);
  if (!level3Sponsor || level3Sponsor.membership !== "active") return;

  const l3Financials = COUNTRY_FINANCIALS[level3Sponsor.country ?? "INTL"];
  if (l3Financials && l3Financials.l3 > 0) {
    await ctx.db.insert("earnings", {
      userId: level3Sponsor._id,
      amount: l3Financials.l3,
      currency: l3Financials.currency,
      source: "level_3",
      fromUserId: newlyActiveUserId,
    });
  }
}