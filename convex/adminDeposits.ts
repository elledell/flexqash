import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./access";

const COUNTRIES = [
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "UG", name: "Uganda", currency: "UGX" },
  { code: "TZ", name: "Tanzania", currency: "TZS" },
  { code: "MW", name: "Malawi", currency: "MWK" },
  { code: "ZM", name: "Zambia", currency: "ZMW" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "RW", name: "Rwanda", currency: "RWF" },
  { code: "BI", name: "Burundi", currency: "BIF" },
  { code: "BW", name: "Botswana", currency: "BWP" },
  { code: "CM", name: "Cameroon", currency: "XAF" },
  { code: "SS", name: "South Sudan", currency: "SSP" },
  { code: "CD", name: "DR Congo", currency: "CDF" },
  { code: "INT", name: "International", currency: "USD" },
];

export const getFinanceOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allPayments = await ctx.db.query("payments").collect();
    const allUsers = await ctx.db.query("users").collect();
    const userMap = new Map(allUsers.map((u) => [u._id, u]));

    const validCompletedPayments = allPayments.filter(p => p.status === "paid" && userMap.has(p.userId));

    const totalTx = validCompletedPayments.length;
    const completedTx = validCompletedPayments.length;
    const successRate = totalTx > 0 ? 100 : 0; 

    const countryStats: Record<string, { volume: number; txCount: number }> = {};
    COUNTRIES.forEach((c) => {
      countryStats[c.code] = { volume: 0, txCount: 0 };
    });

    for (const p of validCompletedPayments) {
      const u = userMap.get(p.userId)!;
      const cCode = u.country || "KE";
      if (countryStats[cCode]) {
        countryStats[cCode].txCount++;
        countryStats[cCode].volume += p.amount;
      }
    }

    const countryBreakdown = COUNTRIES.map((c) => ({
      ...c,
      volume: countryStats[c.code].volume,
      txCount: countryStats[c.code].txCount,
    })).filter((c) => c.txCount > 0); 

    return {
      totalTx,
      completedTx,
      successRate,
      countryBreakdown,
    };
  },
});

export const getCountryDeposits = query({
  args: {
    countryCode: v.string(),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { countryCode, search, status }) => {
    await requireAdmin(ctx);
    
    const allUsers = await ctx.db.query("users").collect();
    const countryUsers = new Set(allUsers.filter((u) => u.country === countryCode).map((u) => u._id));
    const userMap = new Map(allUsers.map((u) => [u._id, u]));

    let deposits = await ctx.db.query("payments").order("desc").collect();
    
    // Fetch ALL deposits for this country so the table/dropdown works
    deposits = deposits.filter((d) => countryUsers.has(d.userId));

    // STRICT MATH: Only sum up and count 'paid' transactions for the top cards
    const paidDeposits = deposits.filter(d => d.status === "paid");
    const volume = paidDeposits.reduce((sum, p) => sum + p.amount, 0);
    const completedTx = paidDeposits.length;
    const totalTx = paidDeposits.length; 
    const successRate = deposits.length > 0 ? Math.round((completedTx / deposits.length) * 100) : 0;

    // Apply the dropdown filter for the table view
    if (status && status !== "all") {
      deposits = deposits.filter((d) => d.status === status);
    }

    if (search) {
      const s = search.toLowerCase();
      deposits = deposits.filter((d) => {
        const u = userMap.get(d.userId);
        const email = u?.email?.toLowerCase() || "";
        const name = u?.name?.toLowerCase() || "";
        const phone = d.phone?.toLowerCase() || "";
        const receipt = d.receipt?.toLowerCase() || d.transactionId?.toLowerCase() || "";
        return email.includes(s) || name.includes(s) || phone.includes(s) || receipt.includes(s);
      });
    }

    const items = deposits.slice(0, 100).map((d) => {
      const u = userMap.get(d.userId);
      return {
        _id: d._id,
        phone: d.phone,
        user: u?.name || u?.email || "N/A",
        amount: d.amount,
        currency: d.currency,
        status: d.status,
        receipt: d.receipt || d.transactionId || "-",
        date: d._creationTime,
      };
    });

    const countryName = COUNTRIES.find(c => c.code === countryCode)?.name || countryCode;
    const currency = COUNTRIES.find(c => c.code === countryCode)?.currency || "";

    return {
      countryName,
      currency,
      volume,
      totalTx,
      completedTx,
      successRate,
      items,
    };
  },
});

export const getManagementProfits = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allPayments = await ctx.db.query("payments").collect();
    const allEarnings = await ctx.db.query("earnings").collect();
    const allUsers = await ctx.db.query("users").collect();
    const allRates = await ctx.db.query("exchangeRates").collect();
    
    const userMap = new Map(allUsers.map((u) => [u._id, u]));

    const rateMap: Record<string, number> = { KES: 1 };
    for (const r of allRates) {
      rateMap[r.currency] = typeof r.rateToKES === 'string' ? parseFloat(r.rateToKES) : r.rateToKES;
    }

    const profitStats: Record<string, { revenue: number; payouts: number; txCount: number }> = {};
    COUNTRIES.forEach((c) => {
      profitStats[c.code] = { revenue: 0, payouts: 0, txCount: 0 };
    });

    for (const p of allPayments) {
      if (p.status !== "paid") continue;
      const u = userMap.get(p.userId);
      if (!u) continue; 

      const cCode = u.country || "KE";
      if (profitStats[cCode]) {
        profitStats[cCode].revenue += p.amount;
        profitStats[cCode].txCount += 1;
      }
    }

    for (const e of allEarnings) {
      if (["level_1", "level_2", "level_3"].includes(e.source)) {
        const sourceCountryCode = e.sourceCountry || "KE";
        const sourceCurrency = COUNTRIES.find(c => c.code === sourceCountryCode)?.currency || "KES";
        const paidCurrency = e.currency || "KES";
        
        if (profitStats[sourceCountryCode]) {
          let expenseInSourceCurrency = e.amount;
          
          if (paidCurrency !== sourceCurrency) {
            const paidRate = rateMap[paidCurrency] || 1;
            const sourceRate = rateMap[sourceCurrency] || 1;
            
            const amountInKES = paidCurrency === "KES" ? e.amount : e.amount / paidRate;
            expenseInSourceCurrency = sourceCurrency === "KES" ? amountInKES : amountInKES * sourceRate;
          }
          
          profitStats[sourceCountryCode].payouts += expenseInSourceCurrency;
        }
      }
    }

    const countryProfits = COUNTRIES.map((c) => {
      const stats = profitStats[c.code];
      let nativeProfit = stats.revenue - stats.payouts;

      // ⚠️ FIXED PROFIT OVERRIDES (Gateway Factoring) ⚠️
      if (c.code === "MW") {
        const conversionRate = rateMap["MWK"] || 1;
        nativeProfit = (60 * stats.txCount) * conversionRate;
      } else if (c.code === "ZM") {
        const conversionRate = rateMap["ZMW"] || 1;
        nativeProfit = (70 * stats.txCount) * conversionRate;
      }

      return {
        ...c,
        revenue: Math.round(stats.revenue),
        payouts: Math.round(stats.payouts),
        profit: Math.round(nativeProfit),
      };
    }).filter((c) => c.revenue > 0 || c.payouts > 0); 

    return countryProfits;
  }
});

export const getTopEarners = query({
  args: { searchTerm: v.optional(v.string()) },
  handler: async (ctx, { searchTerm }) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("users").collect();
    const allEarnings = await ctx.db.query("earnings").collect();
    const allRates = await ctx.db.query("exchangeRates").collect();

    // Build the exchange rate map anchored to KES
    const rateMap: Record<string, number> = { KES: 1 };
    for (const r of allRates) {
      rateMap[r.currency] = typeof r.rateToKES === 'string' ? parseFloat(r.rateToKES) : r.rateToKES;
    }

    // Group all earnings by the user who received them
    const userEarningsMap = new Map<string, number>();
    for (const e of allEarnings) {
      const current = userEarningsMap.get(e.userId) || 0;
      userEarningsMap.set(e.userId, current + e.amount);
    }

    let results = [];
    for (const [userId, nativeTotal] of userEarningsMap.entries()) {
      if (nativeTotal <= 0) continue;

      const u = allUsers.find(user => user._id === userId);
      if (!u) continue;

      const currency = u.currency || "KES";
      const conversionRate = rateMap[currency] || 1;
      
      // Convert the user's native total into KES for standardized sorting
      const totalInKES = currency === "KES" ? nativeTotal : nativeTotal / conversionRate;

      results.push({
        _id: u._id,
        username: u.username || u.name || "Unknown",
        email: u.email || "No Email",
        phone: u.phone || "No Phone",
        country: u.country || "KE",
        currency: currency,
        nativeTotal: Math.round(nativeTotal),
        kesTotal: Math.round(totalInKES)
      });
    }

    // Apply the search filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      results = results.filter(r =>
        r.username.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s)
      );
    }

    // Sort by the standardized KES total (Highest to Lowest)
    results.sort((a, b) => b.kesTotal - a.kesTotal);

    return results;
  }
});