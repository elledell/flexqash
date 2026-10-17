import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

// NOTE: If Resend throws a delivery error later, change this to "onboarding@resend.dev" until your domain is verified.
const SENDER_EMAIL = "FlexQash <hellenmochama7@gmail.com>"; 

export const sendActivationEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, { email, name }) => {
    // 1. Initialize inside the handler to prevent build-time crashes
    // NOTE: If your key is named something else in your Convex settings (like AUTH_RESEND_KEY), change it here!
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: "Your FlexQash Account is Activated! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; color: #112a46; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #1abc9c;">Welcome to FlexQash, ${name}!</h2>
            <p>Great news! Your account has been officially activated by our administration team.</p>
            <p>You can now log in to your dashboard, start investing, apply for gigs, and share your referral code to earn commissions.</p>
            <br/>
            <a href="https://flexqash.com/dashboard" style="background-color: #112a46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            <br/><br/>
            <p>Best regards,<br/><strong>The FlexQash Team</strong></p>
          </div>
        `
      });
    } catch (error) {
      console.error("Failed to send activation email:", error);
    }
  }
});

export const sendWithdrawalApprovalEmail = internalAction({
  args: { email: v.string(), name: v.string(), amount: v.number(), currency: v.string() },
  handler: async (ctx, { email, name, amount, currency }) => {
    // 1. Initialize inside the handler
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: "Withdrawal Approved & Sent! 💸",
        html: `
          <div style="font-family: Arial, sans-serif; color: #112a46; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #1abc9c;">Withdrawal Successful!</h2>
            <p>Hello ${name},</p>
            <p>Your withdrawal request for <strong>${currency} ${amount.toLocaleString()}</strong> has been approved and processed by our team.</p>
            <p>Please check your mobile money or bank account to confirm you have received the funds.</p>
            <br/>
            <p>Thank you for using FlexQash!</p>
            <p><strong>The FlexQash Team</strong></p>
          </div>
        `
      });
    } catch (error) {
      console.error("Failed to send withdrawal email:", error);
    }
  }
});