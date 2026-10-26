import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api"; 
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
      .reduce((sum, w) => sum + w.netAmount, 0); // User received the netAmount

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
    amount: v.number(), // The exact amount they want to receive
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

    // M-Pesa Style: Fee is added to the requested amount
    const totalDeduction = amount + feeInfo.fee;

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
    if (totalDeduction > availableBalance) {
      throw new ConvexError(
        `Insufficient balance. You need ${feeInfo.currency} ${totalDeduction.toLocaleString()} (including fee) but only have ${availableBalance.toLocaleString()}`
      );
    }

    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId,
      amount: totalDeduction, // Gross amount deducted from balance
      fee: feeInfo.fee,
      netAmount: amount, // Exact amount sent to user
      currency: feeInfo.currency,
      status: "pending",
      method,
      paymentDetails: JSON.stringify({ recipientPhone, recipientName }),
    });

    // 📩 FIRE THE ADMIN ALERT EMAIL
    await ctx.scheduler.runAfter(0, internal.emails.sendAdminWithdrawAlert, {
      adminEmails: ["lionizer254@gmail.com", "hellenmochama6@gmail.com"],
      userName: user.name || user.username || "Unknown Member",
      userPhone: recipientPhone,
      userCountry: country,
      amount: amount,
      currency: feeInfo.currency,
      method: method
    });

    return { withdrawalId };
  },
});

export const getUserWithdrawals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allWithdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
      
    return allWithdrawals
      .filter(
        (w) => 
          w.method !== "wallet_transfer" && 
          w.method !== "gig_bidding_fee" && 
          w.method !== "investment_purchase"
      )
      .slice(0, 25);
  },
});

export const listAllWithdrawals = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    countryCode: v.optional(v.string()), 
  },
  handler: async (ctx, { status, countryCode }) => {
    await requireAdmin(ctx);

    const rows = await ctx.db.query("withdrawals").order("desc").take(500); 
    const filteredByStatus = status ? rows.filter((r) => r.status === status) : rows;

    const list = [];
    for (const w of filteredByStatus) {
      const u = await ctx.db.get(w.userId);
      const userCountry = u?.country || "KE";
      
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

    // 📩 FIRE THE WITHDRAWAL APPROVAL EMAIL TO USER
    if (status === "approved") {
      const user = await ctx.db.get(w.userId);
      if (user?.email) {
        await ctx.scheduler.runAfter(0, internal.emails.sendWithdrawalApprovalEmail, {
          email: user.email,
          name: user.name || user.username || "Member",
          amount: w.netAmount, 
          currency: w.currency,
          countryCode: user.country || "KE" // ADDED: Passes the country code for the dynamic fee calculator
        });
      }
    }

    return { success: true };
  },
});