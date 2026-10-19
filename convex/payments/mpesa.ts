/// <reference types="node" />
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function baseUrl() {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

// Daraja wants 254XXXXXXXXX
function normalizeKenyanPhone(input: string) {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("0")) d = "254" + d.slice(1);
  else if (/^[17]\d{8}$/.test(d)) d = "254" + d;
  if (!/^254[17]\d{8}$/.test(d)) throw new ConvexError("Enter a valid Safaricom number.");
  return d;
}

// YYYYMMDDHHmmss in Nairobi time (UTC+3)
function timestamp() {
  return new Date(Date.now() + 3 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);
}

async function getToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("M-Pesa keys are not set");
  const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: "Basic " + btoa(`${key}:${secret}`) },
  });
  if (!res.ok) throw new Error(`Daraja auth failed (${res.status})`);
  const data = await res.json();
  return data.access_token as string;
}

// 1. Existing action: Membership Activation
export const start = action({
  args: { phone: v.string() },
  handler: async (ctx, { phone }): Promise<{ paymentId: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Please sign in.");

    const msisdn = normalizeKenyanPhone(phone);
    const { paymentId, amount } = await ctx.runMutation(internal.membership.createPending, {
      userId,
      phone: msisdn,
    });

    try {
      const shortcode = process.env.MPESA_SHORTCODE!;
      const partyB = process.env.MPESA_PARTYB ?? shortcode;
      const passkey = process.env.MPESA_PASSKEY!;
      const ts = timestamp();
      const token = await getToken();

      const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: btoa(`${shortcode}${passkey}${ts}`),
          Timestamp: ts,
          TransactionType: process.env.MPESA_TRANSACTION_TYPE ?? "CustomerPayBillOnline",
          Amount: amount,
          PartyA: msisdn,
          PartyB: partyB,
          PhoneNumber: msisdn,
          CallBackURL: `${process.env.MPESA_CALLBACK_BASE}/daraja/callback?s=${process.env.MPESA_CALLBACK_SECRET}`,
          AccountReference: "FlexQash",
          TransactionDesc: "Membership",
        }),
      });
      const data = await res.json();
      if (data.ResponseCode !== "0") {
        throw new Error(data.errorMessage ?? data.ResponseDescription ?? "STK push rejected");
      }

      await ctx.runMutation(internal.membership.attachCheckout, {
        paymentId,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
      });
      return { paymentId };
    } catch (e) {
      console.error("STK push failed:", e);
      await ctx.runMutation(internal.membership.markFailed, {
        paymentId,
        reason: "Could not start the M-Pesa prompt",
      });
      throw new ConvexError("Could not send the M-Pesa prompt. Please try again.");
    }
  },
});

// 2. Existing action: Direct Status Query
export const check = action({
  args: {},
  handler: async (ctx): Promise<{ checked: boolean }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Please sign in.");

    const p = await ctx.runQuery(internal.membership.latestPendingForUser, { userId });
    if (!p) return { checked: false };

    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const ts = timestamp();
    const token = await getToken();

    const res = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: btoa(`${shortcode}${passkey}${ts}`),
        Timestamp: ts,
        CheckoutRequestID: p.checkoutRequestId,
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (data.ResultCode === undefined || data.ResultCode === null) return { checked: false };
    const code = Number(data.ResultCode);
    const desc = String(data.ResultDesc ?? "");

    if (code === 4999 || /still under processing/i.test(desc)) return { checked: false };

    await ctx.runMutation(internal.membership.applyMpesaResult, {
      checkoutRequestId: p.checkoutRequestId,
      resultCode: code,
      resultDesc: desc,
      amount: p.amount,
    });
    return { checked: true };
  },
});

// 3. Dedicated action: Automated Wallet Deposit
export const startDeposit = action({
  args: { phone: v.string(), amount: v.number() },
  handler: async (ctx, { phone, amount }): Promise<{ paymentId: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Please sign in.");
    if (amount < 100) throw new ConvexError("Minimum deposit is KES 100.");

    const msisdn = normalizeKenyanPhone(phone);
    const { paymentId } = await ctx.runMutation(internal.deposit.createPendingMpesaDeposit, {
      userId,
      phone: msisdn,
      amount,
    });

    try {
      const shortcode = process.env.MPESA_SHORTCODE!;
      const partyB = process.env.MPESA_PARTYB ?? shortcode;
      const passkey = process.env.MPESA_PASSKEY!;
      const ts = timestamp();
      const token = await getToken();

      const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: btoa(`${shortcode}${passkey}${ts}`),
          Timestamp: ts,
          TransactionType: process.env.MPESA_TRANSACTION_TYPE ?? "CustomerPayBillOnline",
          Amount: amount,
          PartyA: msisdn,
          PartyB: partyB,
          PhoneNumber: msisdn,
          CallBackURL: `${process.env.MPESA_CALLBACK_BASE}/daraja/callback?s=${process.env.MPESA_CALLBACK_SECRET}`,
          AccountReference: "FlexQash",
          TransactionDesc: "Wallet Deposit",
        }),
      });

      const data = await res.json();
      if (data.ResponseCode !== "0") {
        throw new Error(data.errorMessage ?? data.ResponseDescription ?? "STK push rejected");
      }

      await ctx.runMutation(internal.deposit.attachDepositCheckout, {
        paymentId,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
      });

      return { paymentId };
    } catch (e) {
      console.error("STK push deposit failed:", e);
      await ctx.runMutation(internal.membership.markFailed, {
        paymentId,
        reason: "Could not start M-Pesa prompt for deposit",
      });
      throw new ConvexError("Could not send M-Pesa deposit prompt. Please try again.");
    }
  },
});