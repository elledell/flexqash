import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./access";
import { COUNTRIES } from "./countries";

const METHOD_LABEL: Record<string, string> = {
  mpesa: "M-Pesa (Kenya)",
  manual: "Mobile Money (Manual)",
  selar: "Selar Gateway",
  paystack: "Paystack",
};

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("failed"),
        v.literal("review")
      )
    ),
  },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx); // server-side check

    const rows = await ctx.db.query("payments").order("desc").take(300);

    const paidTotals: Record<string, number> = {};
    const counts = { pending: 0, paid: 0, failed: 0, review: 0 };
    for (const r of rows) {
      counts[r.status] += 1;
      if (r.status === "paid") {
        paidTotals[r.currency] = (paidTotals[r.currency] ?? 0) + r.amount;
      }
    }

    const shown = status ? rows.filter((r) => r.status === status) : rows;

    const userCache = new Map<string, { name?: string; email?: string; country?: string } | null>();
    const items = [];
    for (const r of shown) {
      let u = userCache.get(r.userId);
      if (u === undefined) {
        const doc = await ctx.db.get(r.userId);
        u = doc ? { name: doc.name, email: doc.email, country: doc.country } : null;
        userCache.set(r.userId, u);
      }
      items.push({
        _id: r._id,
        createdAt: r._creationTime,
        name: u?.name ?? "(deleted)",
        email: u?.email ?? "",
        countryCode: u?.country ?? "",
        countryName: COUNTRIES.find((c) => c.code === u?.country)?.name ?? "",
        phone: r.phone,
        purpose: r.purpose ?? "membership",
        method: r.methodTitle ?? METHOD_LABEL[r.provider] ?? r.provider,
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        receipt: r.receipt ?? "",
        resultDesc: r.resultDesc ?? "",
      });
    }

    return { items, counts, paidTotals };
  },
});

export const approvePayment = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    await requireAdmin(ctx);

    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new ConvexError("Payment record not found.");
    if (payment.status === "paid") throw new ConvexError("Payment is already approved.");

    // 1. Mark payment as paid
    await ctx.db.patch(paymentId, {
      status: "paid",
      resultDesc: "Approved by Admin",
    });

    // 2. Route based on payment purpose
    if (payment.purpose === "deposit") {
      // Credit their wallet ledger directly
      await ctx.db.insert("earnings", {
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        source: "deposit",
      });
    } else {
      // Otherwise, it's a membership activation
      await ctx.db.patch(payment.userId, {
        membership: "active",
        membershipPaidAt: Date.now(),
      });
      
      // Note: If you have an affiliate distribution function, you can import and call it here
      // e.g., await distributeCommissions(ctx, payment.userId);
    }

    return { success: true };
  },
});

export const rejectPayment = mutation({
  args: { paymentId: v.id("payments"), reason: v.string() },
  handler: async (ctx, { paymentId, reason }) => {
    await requireAdmin(ctx);

    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new ConvexError("Payment record not found.");

    await ctx.db.patch(paymentId, {
      status: "failed",
      resultDesc: reason,
    });

    return { success: true };
  },
});