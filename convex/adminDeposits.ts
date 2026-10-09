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
];

export const getFinanceOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Removed the strict "deposit" filter so legacy test data shows up
    const allPayments = await ctx.db
      .query("payments")
      .collect();
      
    const allUsers = await ctx.db.query("users").collect();
    const userMap = new Map(allUsers.map((u) => [u._id, u]));

    const totalTx = allPayments.length;
    const completedTx = allPayments.filter((p) => p.status === "paid").length;
    const successRate = totalTx > 0 ? Math.round((completedTx / totalTx) * 100) : 0;

    // Group by country
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

    // Only return countries with actual transaction activity
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

    // Removed the strict "deposit" filter here as well
    let deposits = await ctx.db
      .query("payments")
      .order("desc")
      .collect();

    // Filter by selected country
    deposits = deposits.filter((d) => countryUsers.has(d.userId));

    const totalTx = deposits.length;
    const completedTx = deposits.filter((p) => p.status === "paid").length;
    const volume = deposits.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const successRate = totalTx > 0 ? Math.round((completedTx / totalTx) * 100) : 0;

    // Apply Status Filter
    if (status && status !== "all") {
      deposits = deposits.filter((d) => d.status === status);
    }

    // Apply Search Filter
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