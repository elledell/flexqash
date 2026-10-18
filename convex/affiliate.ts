import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { COUNTRY_FINANCIALS } from "./financials";

export async function distributeCommissions(
  ctx: MutationCtx,
  newlyActiveUserId: Id<"users">
) {
  const newMember = await ctx.db.get(newlyActiveUserId);
  if (!newMember || !newMember.invitedBy) return; // No upline to pay

  const sourceCountry = newMember.country || "KE";
  const sourceFinancials =
    COUNTRY_FINANCIALS[sourceCountry] ?? COUNTRY_FINANCIALS.KE;

  // Load exchange rates for cross-border conversion (KES-anchor)
  const allRates = await ctx.db.query("exchangeRates").collect();
  const rateMap: Record<string, number> = { KES: 1 };
  for (const r of allRates) {
    rateMap[r.currency] = r.rateToKES;
  }

  // Convert from the referee's currency to the referrer's currency
  const convertAmount = (
    amount: number,
    fromCurr: string,
    toCurr: string,
    fallbackAmount: number
  ) => {
    if (fromCurr === toCurr) return amount;
    const fromRate = rateMap[fromCurr];
    const toRate = rateMap[toCurr];
    // If admin hasn't entered the exchange rate yet, safely fallback to sponsor's native tier
    if (!fromRate || !toRate) return fallbackAmount;

    const amountInKES = fromCurr === "KES" ? amount : amount / fromRate;
    const finalAmount = toCurr === "KES" ? amountInKES : amountInKES * toRate;
    return Math.round(finalAmount);
  };

  const levels: Array<{
    source: "level_1" | "level_2" | "level_3";
    tierKey: "l1" | "l2" | "l3";
  }> = [
    { source: "level_1", tierKey: "l1" },
    { source: "level_2", tierKey: "l2" },
    { source: "level_3", tierKey: "l3" },
  ];

  let currentSponsorId: Id<"users"> | undefined = newMember.invitedBy;

  for (const level of levels) {
    if (!currentSponsorId) break;

    // Explicitly typing `sponsor` as Doc<"users"> | null resolves the TS error
    const sponsor: Doc<"users"> | null = await ctx.db.get(currentSponsorId);
    if (!sponsor) break;

    // Only pay active sponsors, and prevent duplicate payouts for the same referee
    if (sponsor.membership === "active") {
      const alreadyPaid = await ctx.db
        .query("earnings")
        .withIndex("by_user_source", (q) =>
          q.eq("userId", sponsor._id).eq("source", level.source)
        )
        .filter((q) => q.eq(q.field("fromUserId"), newlyActiveUserId))
        .first();

      if (!alreadyPaid) {
        const sponsorCountry = sponsor.country || "KE";
        const sponsorFinancials =
          COUNTRY_FINANCIALS[sponsorCountry] ?? COUNTRY_FINANCIALS.KE;
        const sponsorCurrency = sponsor.currency || sponsorFinancials.currency;
        const fallbackInSponsorCurrency = sponsorFinancials[level.tierKey];

        let payoutAmount = 0;

        // ⚠️ THE MALAWI EXCEPTION RULE ⚠️
        if (sourceCountry === "MW" && sponsorCountry !== "MW") {
          // Hardcoded KES baseline for foreigners referring Malawians
          const MALAWI_FOREIGNER_EXCEPTION_KES = {
            l1: 150,
            l2: 80,
            l3: 50,
          };
          const exceptionBaseInKES = MALAWI_FOREIGNER_EXCEPTION_KES[level.tierKey];
          
          payoutAmount = convertAmount(
            exceptionBaseInKES,
            "KES", // Starting from our fixed KES rate
            sponsorCurrency, // Converting to the foreign sponsor's currency
            fallbackInSponsorCurrency
          );
        } else {
          // The Standard Logic (Malawi -> Malawi, or Kenya -> Uganda, etc.)
          const baseBonusInSourceCurrency = sourceFinancials[level.tierKey];
          
          payoutAmount = convertAmount(
            baseBonusInSourceCurrency,
            sourceFinancials.currency,
            sponsorCurrency,
            fallbackInSponsorCurrency
          );
        }

        if (payoutAmount > 0) {
          await ctx.db.insert("earnings", {
            userId: sponsor._id,
            amount: payoutAmount,
            currency: sponsorCurrency,
            source: level.source,
            fromUserId: newlyActiveUserId,
            sourceCountry: sourceCountry,
            sourceUsername: newMember.username || newMember.name || "Member",
          });

          // 📩 Fire the Earnings Notification Email
          if (sponsor.email) {
            // Converts "level_1" to "1" for the email subject line
            const levelNumber = level.source.split("_")[1]; 
            await ctx.scheduler.runAfter(0, internal.emails.sendEarningsEmail, {
              email: sponsor.email,
              name: sponsor.name || sponsor.username || "Member",
              amount: payoutAmount,
              currency: sponsorCurrency,
              level: levelNumber,
              fromUsername: newMember.username || newMember.name || "Member",
            });
          }
        }
      }
    }

    // Move up the chain (Level 1 -> Level 2 -> Level 3)
    currentSponsorId = sponsor.invitedBy;
  }
}