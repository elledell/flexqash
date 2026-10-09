/// <reference types="node" />
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

// Safaricom calls this after the customer approves or cancels.
// Keep words like "mpesa" or "safaricom" out of this path, because Daraja can reject such URLs.
http.route({
  path: "/daraja/callback",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const ok = new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const secret = new URL(req.url).searchParams.get("s");
    if (!secret || secret !== process.env.MPESA_CALLBACK_SECRET) {
      return new Response("Forbidden", { status: 403 });
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return ok;
    }

    const cb = payload?.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return ok;

    const items: { Name: string; Value?: string | number }[] = cb.CallbackMetadata?.Item ?? [];
    const pick = (name: string) => items.find((i) => i.Name === name)?.Value;

    await ctx.runMutation(internal.membership.applyMpesaResult, {
      checkoutRequestId: String(cb.CheckoutRequestID),
      resultCode: Number(cb.ResultCode),
      resultDesc: String(cb.ResultDesc ?? ""),
      amount: typeof pick("Amount") === "number" ? (pick("Amount") as number) : undefined,
      receipt: pick("MpesaReceiptNumber") ? String(pick("MpesaReceiptNumber")) : undefined,
    });

    return ok;
  }),
});

export default http;