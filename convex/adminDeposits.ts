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
  { code: "INT", name: "International", currency: "USD" }, // Added International
];

export const getFinanceOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allPayments = await ctx.db.query("payments").collect();
      
    const allUsers = await ctx.db.query("users").collect();
    const userMap = new Map(allUsers.map((u) => [u._id, u]));

    const totalTx = allPayments.length;
    const completedTx = allPayments.filter((p) => p.status === "paid").length;
    const successRate = totalTx > 0 ? Math.round((completedTx / totalTx) * 100) : 0;

    const countryStats: Record<string, { volume: number; txCount: number }> = {};
    COUNTRIES.forEach((c) => {
      countryStats[c.code] = { volume: 0, txCount: 0 };
    });

    for (const p of allPayments) {
      const u = userMap.get(p.userId);
      const cCode = u?.country || "KE";
      if (!countryStats[cCode]) countryStats[cCode] = { volume: 0, txCount: 0 };
      
      countryStats[cCode].txCount++;
      if (p.status === "paid") {
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
    deposits = deposits.filter((d) => countryUsers.has(d.userId));

    const totalTx = deposits.length;
    const completedTx = deposits.filter((p) => p.status === "paid").length;
    const volume = deposits.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const successRate = totalTx > 0 ? Math.round((completedTx / totalTx) * 100) : 0;

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

// --------------------------------------------------------
// NEW: Calculate Management Profits per Country
// --------------------------------------------------------
export const getManagementProfits = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all successful deposits and all earnings payouts
    const allPayments = await ctx.db.query("payments").filter(q => q.eq(q.field("status"), "paid")).collect();
    const allEarnings = await ctx.db.query("earnings").collect();
    const allUsers = await ctx.db.query("users").collect();
    const userMap = new Map(allUsers.map((u) => [u._id, u]));

    const profitStats: Record<string, { revenue: number; payouts: number; profit: number }> = {};
    COUNTRIES.forEach((c) => {
      profitStats[c.code] = { revenue: 0, payouts: 0, profit: 0 };
    });

    // 1. Calculate Total Revenue (Deposits) per country
    for (const p of allPayments) {
      const u = userMap.get(p.userId);
      const cCode = u?.country || "KE";
      if (profitStats[cCode]) {
        profitStats[cCode].revenue += p.amount;
      }
    }

    // 2. Calculate Total Expenses (L1, L2, L3 Payouts) per country
    for (const e of allEarnings) {
      // Only count referral commissions as expenses against the activation fee
      if (["level_1", "level_2", "level_3"].includes(e.source)) {
        // Use the sourceCountry (the country where the fee originated)
        const cCode = e.sourceCountry || "KE";
        if (profitStats[cCode]) {
          profitStats[cCode].payouts += e.amount;
        }
      }
    }

    // 3. Map into the final array and remove countries with zero activity
    const countryProfits = COUNTRIES.map((c) => {
      const stats = profitStats[c.code];
      return {
        ...c,
        revenue: stats.revenue,
        payouts: stats.payouts,
        profit: stats.revenue - stats.payouts,
      };
    }).filter((c) => c.revenue > 0 || c.payouts > 0); 

    return countryProfits;
  }
});