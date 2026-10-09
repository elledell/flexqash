import { v, ConvexError } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { COUNTRIES } from "./countries";
import { PROVIDER_BY_COUNTRY } from "./payments/routing";
import { requireAdmin } from "./access";

// What the membership page needs to show
export const status = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const country = user.country;
    const price = country
      ? await ctx.db
          .query("membershipPrices")
          .withIndex("by_country", (q) => q.eq("country", country))
          .first()
      : null;

    return {
      active: user.membership === "active",
      currency: user.currency ?? null,
      amount: price?.amount ?? null,
      provider: country ? PROVIDER_BY_COUNTRY[country] ?? null : null,
      country: country ?? null,
    };
  },
});

export const getPayment = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const p = await ctx.db.get(paymentId);
    if (!p || p.userId !== userId) return null;
    return { status: p.status, receipt: p.receipt, resultDesc: p.resultDesc };
  },
});

// ---------- Admin "door": set the activation amount per country ----------
export const adminPrices = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const me = await ctx.db.get(userId);
    if (me?.role !== "admin") return null;

    const rows = await ctx.db.query("membershipPrices").collect();
    return COUNTRIES.map((c) => ({
      code: c.code,
      name: c.name,
      currency: c.currency,
      amount: rows.find((r) => r.country === c.code)?.amount ?? null,
      provider: PROVIDER_BY_COUNTRY[c.code] ?? null,
    }));
  },
});

export const setPrice = mutation({
  args: { country: v.string(), amount: v.number() },
  handler: async (ctx, { country, amount }) => {
    const admin = await requireAdmin(ctx); // checked on the server
    const c = COUNTRIES.find((x) => x.code === country);
    if (!c) throw new ConvexError("Unknown country.");
    if (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000) {
      throw new ConvexError("Enter a whole number between 1 and 10,000,000.");
    }

    const existing = await ctx.db
      .query("membershipPrices")
      .withIndex("by_country", (q) => q.eq("country", country))
      .first();
    const row = {
      country,
      currency: c.currency,
      amount,
      updatedBy: admin._id,
      updatedAt: Date.now(),
    };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("membershipPrices", row);
  },
});

// ---------- Payment steps (internal) ----------
export const createPending = internalMutation({
  args: { userId: v.id("users"), phone: v.string() },
  handler: async (ctx, { userId, phone }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Account not found.");
    if (user.membership === "active") throw new ConvexError("Your membership is already active.");
    if (!user.country || PROVIDER_BY_COUNTRY[user.country] !== "mpesa") {
      throw new ConvexError("M-Pesa is not available for your country yet.");
    }

    const price = await ctx.db
      .query("membershipPrices")
      .withIndex("by_country", (q) => q.eq("country", user.country!))
      .first();
    if (!price) throw new ConvexError("The membership fee has not been set yet. Please check back soon.");

    const recent = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (recent && recent.status === "pending" && Date.now() - recent._creationTime < 2 * 60 * 1000) {
      throw new ConvexError("A prompt was just sent. Check your phone, or wait 2 minutes to try again.");
    }

    const paymentId = await ctx.db.insert("payments", {
      userId,
      provider: "mpesa",
      amount: price.amount,
      currency: price.currency,
      phone,
      status: "pending",
    });
    return { paymentId, amount: price.amount };
  },
});

export const attachCheckout = internalMutation({
  args: {
    paymentId: v.id("payments"),
    checkoutRequestId: v.string(),
    merchantRequestId: v.string(),
  },
  handler: async (ctx, { paymentId, checkoutRequestId, merchantRequestId }) => {
    await ctx.db.patch(paymentId, { checkoutRequestId, merchantRequestId });
  },
});

export const markFailed = internalMutation({
  args: { paymentId: v.id("payments"), reason: v.string() },
  handler: async (ctx, { paymentId, reason }) => {
    await ctx.db.patch(paymentId, { status: "failed", resultDesc: reason });
  },
});

export const latestPendingForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const p = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (!p || p.status !== "pending" || !p.checkoutRequestId) return null;
    return { checkoutRequestId: p.checkoutRequestId, amount: p.amount };
  },
});

export const applyMpesaResult = internalMutation({
  args: {
    checkoutRequestId: v.string(),
    resultCode: v.number(),
    resultDesc: v.string(),
    amount: v.optional(v.number()),
    receipt: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_checkoutRequestId", (q) => q.eq("checkoutRequestId", a.checkoutRequestId))
      .first();
    if (!payment) return;

    if (payment.status !== "pending") {
      if (payment.status === "paid" && !payment.receipt && a.resultCode === 0 && a.receipt) {
        await ctx.db.patch(payment._id, { receipt: a.receipt });
      }
      return;
    }

    if (a.resultCode !== 0) {
      await ctx.db.patch(payment._id, { status: "failed", resultDesc: a.resultDesc });
      return;
    }

    if (a.amount !== payment.amount) {
      await ctx.db.patch(payment._id, {
        status: "review",
        receipt: a.receipt,
        resultDesc: `Amount mismatch: expected ${payment.amount}, got ${a.amount}`,
      });
      return;
    }

    await ctx.db.patch(payment._id, {
      status: "paid",
      receipt: a.receipt,
      resultDesc: a.resultDesc,
    });
    await ctx.db.patch(payment.userId, {
      membership: "active",
      membershipPaidAt: Date.now(),
    });
  },
});

// ---------- Manual Payment Handlers (Uganda, Tanzania, etc.) ----------
export const submitManualPayment = mutation({
  args: {
    methodTitle: v.string(),
    phone: v.string(),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, { methodTitle, phone, transactionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Please sign in.");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Account not found.");
    if (user.membership === "active") throw new ConvexError("Membership already active.");

    const price = await ctx.db
      .query("membershipPrices")
      .withIndex("by_country", (q) => q.eq("country", user.country ?? "KE"))
      .first();

    const paymentId = await ctx.db.insert("payments", {
      userId,
      provider: "manual",
      amount: price?.amount ?? 0,
      currency: user.currency ?? "KES",
      phone,
      methodTitle,
      transactionId, 
      status: "pending",
      resultDesc: "Manual verification pending by Admin",
    });

    return { paymentId };
  },
});

export const getUserTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});