import { query } from "./_generated/server";
import { requireAdmin } from "./access";

export const getTransactionProfits = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const deposits = await ctx.db.query("payments")
      .filter(q => q.eq(q.field("status"), "paid"))
      .order("desc")
      .collect();

    const allUsers = await ctx.db.query("users").collect();
    const userMap = new Map(allUsers.map((u) => [u._id, u]));

    const allEarnings = await ctx.db.query("earnings").collect();
    
    // Group earnings by the user who activated and caused them
    const earningsBySource = new Map<string, any[]>();
    for (const e of allEarnings) {
      if (e.fromUserId) {
        const list = earningsBySource.get(e.fromUserId) || [];
        list.push(e);
        earningsBySource.set(e.fromUserId, list);
      }
    }

    const prices = await ctx.db.query("membershipPrices").collect();
    const priceMap = new Map(prices.map((p) => [p.country, p.amount]));

    const rates = await ctx.db.query("exchangeRates").collect();
    const rateMap: Record<string, number> = { KES: 1 };
    for (const r of rates) {
      rateMap[r.currency] = typeof r.rateToKES === 'string' ? parseFloat(r.rateToKES) : r.rateToKES;
    }

    const results = deposits.map((d) => {
      const u = userMap.get(d.userId);
      const country = u?.country || "KE";
      const currency = d.currency || "KES";
      
      // Fallback to the deposit amount if the price table isn't set for that country
      const activationFee = priceMap.get(country) || d.amount; 

      // Find exactly what we paid out to the upline for this specific user
      const relatedEarnings = earningsBySource.get(d.userId) || [];
      let l1 = 0, l2 = 0, l3 = 0;

      relatedEarnings.forEach((e) => {
        const eCurrency = e.currency || "KES";
        let expenseNative = e.amount;
        
        // Reverse cross-border exchange rates
        if (eCurrency !== currency) {
           const paidRate = rateMap[eCurrency] || 1;
           const sourceRate = rateMap[currency] || 1;
           const inKES = eCurrency === "KES" ? e.amount : e.amount / paidRate;
           expenseNative = currency === "KES" ? inKES : inKES * sourceRate;
        }

        if (e.source === "level_1") l1 += expenseNative;
        if (e.source === "level_2") l2 += expenseNative;
        if (e.source === "level_3") l3 += expenseNative;
      });

      const totalExpenses = l1 + l2 + l3;
      let nativeProfit = activationFee - totalExpenses;

      // Final conversion of the remaining profit into Kenya Shillings
      const conversionRate = rateMap[currency] || 1;
      let profitKES = currency === "KES" ? nativeProfit : nativeProfit / conversionRate;

      // ⚠️ FIXED PROFIT OVERRIDES (Gateway Factoring) ⚠️
      // Ignores the standard math and forces the admin profit due to gateway constraints.
      if (country === "MW") {
        profitKES = 60; 
        nativeProfit = 60 * conversionRate; 
      } else if (country === "ZM") {
        profitKES = 70;
        nativeProfit = 70 * conversionRate;
      }

      return {
        _id: d._id,
        date: d._creationTime,
        transactionId: d.transactionId || "Ghost-Activation",
        user: u?.name || u?.username || u?.email || "Unknown",
        country,
        currency,
        activationFee,
        l1: Math.round(l1),
        l2: Math.round(l2),
        l3: Math.round(l3),
        nativeProfit: Math.round(nativeProfit),
        profitKES: Math.round(profitKES),
      };
    });

    return results;
  },
});