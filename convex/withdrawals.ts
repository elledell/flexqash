import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { calculateWithdrawalFee } from "./financials";
import { requireAdmin } from "./access";

export const getWithdrawalInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const country = user.country ?? "KE";

    // Sum earnings
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    // Sum pending and approved withdrawals
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const reservedOrPaid = withdrawals
      .filter((w) => w.status === "pending" || w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = Math.max(0, totalEarnings - reservedOrPaid);

    return {
      currency: user.currency ?? "KES",
      country,
      availableBalance,
      totalWithdrawn,
      phone: user.phone ?? "",
      name: user.name ?? "",
    };
  },
});

export const requestWithdrawal = mutation({
  args: {
    amount: v.number(),
    recipientPhone: v.string(),
    recipientName: v.string(),
    method: v.string(),
  },
  handler: async (ctx, { amount, recipientPhone, recipientName, method }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Please sign in.");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Account not found.");
    if (user.membership !== "active") {
      throw new ConvexError("You must activate your membership before withdrawing.");
    }

    const country = user.country ?? "KE";
    const feeInfo = calculateWithdrawalFee(country, amount);

    if (amount < feeInfo.minWithdrawal) {
      throw new ConvexError(
        `Minimum withdrawal amount is ${feeInfo.currency} ${feeInfo.minWithdrawal.toLocaleString()}`
      );
    }

    // Check available balance
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const reservedOrPaid = withdrawals
      .filter((w) => w.status === "pending" || w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = totalEarnings - reservedOrPaid;
    if (amount > availableBalance) {
      throw new ConvexError(
        `Insufficient balance. Your available balance is ${feeInfo.currency} ${availableBalance.toLocaleString()}`
      );
    }

    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId,
      amount,
      fee: feeInfo.fee,
      netAmount: feeInfo.netAmount,
      currency: feeInfo.currency,
      status: "pending",
      method,
      paymentDetails: JSON.stringify({ recipientPhone, recipientName }),
    });

    return { withdrawalId };
  },
});

export const getUserWithdrawals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(25);
  },
});export const listAllWithdrawals = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    countryCode: v.optional(v.string()), // Added the new country filter
  },
  handler: async (ctx, { status, countryCode }) => {
    await requireAdmin(ctx);

    const rows = await ctx.db.query("withdrawals").order("desc").take(500); // Fetch a larger batch for filtering
    const filteredByStatus = status ? rows.filter((r) => r.status === status) : rows;

    const list = [];
    for (const w of filteredByStatus) {
      const u = await ctx.db.get(w.userId);
      const userCountry = u?.country || "KE";
      
      // If a specific country is selected, skip users who don't match
      if (countryCode && countryCode !== "ALL" && userCountry !== countryCode) {
        continue;
      }

      let parsed = { recipientPhone: "", recipientName: "" };
      try {
        parsed = JSON.parse(w.paymentDetails);
      } catch {
        // fallback
      }
      list.push({
        _id: w._id,
        createdAt: w._creationTime,
        username: u?.username || u?.name || "Unknown",
        userEmail: u?.email || "",
        countryCode: userCountry, 
        amount: w.amount,
        fee: w.fee,
        netAmount: w.netAmount,
        currency: w.currency,
        status: w.status,
        method: w.method,
        recipientPhone: parsed.recipientPhone || u?.phone || "-", 
        recipientName: parsed.recipientName || u?.name || "Unknown",
      });
    }

    return list;
  },
});

export const updateWithdrawalStatus = mutation({
  args: {
    withdrawalId: v.id("withdrawals"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, { withdrawalId, status }) => {
    await requireAdmin(ctx);

    const w = await ctx.db.get(withdrawalId);
    if (!w) throw new ConvexError("Withdrawal record not found.");
    if (w.status !== "pending") throw new ConvexError("This request has already been processed.");

    await ctx.db.patch(withdrawalId, {
      status,
      processedAt: Date.now(),
    });

    return { success: true };
  },
});