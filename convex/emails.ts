import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

const SENDER_EMAIL = "FlexQash <support@send.flexqash.com>"; 

export const sendActivationEmail = internalAction({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, { email, name }) => {
    const resend = new Resend(process.env.AUTH_RESEND_KEY!);

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
            <p>Best regards,<br/><strong>Luxtech Management</strong></p>
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
    const resend = new Resend(process.env.AUTH_RESEND_KEY!);

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
            <p><strong>LUXTECH MANAGEMENT</strong></p>
          </div>
        `
      });
    } catch (error) {
      console.error("Failed to send withdrawal email:", error);
    }
  }
});

export const sendEarningsEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    amount: v.number(),
    currency: v.string(),
    level: v.string(),
    fromUsername: v.string(),
  },
  handler: async (ctx, { email, name, amount, currency, level, fromUsername }) => {
    const resend = new Resend(process.env.AUTH_RESEND_KEY!);

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: `FlexQash L${level} Earnings 💰`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #112a46; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #1abc9c;">Congratulations! 🎉</h2>
            <p>Hello ${name},</p>
            <p>You have just earned <strong>${currency} ${amount.toLocaleString()}</strong> from a Level ${level} referral!</p>
            <p>This commission was instantly added to your wallet because <strong>${fromUsername}</strong> just joined and activated their account in your downline network.</p>
            <br/>
            <a href="https://flexqash.com/dashboard" style="background-color: #112a46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View My Wallet</a>
            <br/><br/>
            <p>Keep up the great work!</p>
            <p><strong>Luxtech Management</strong></p>
          </div>
        `
      });
    } catch (error) {
      console.error("Failed to send earnings email:", error);
    }
  }
});

// NEW ADMIN WITHDRAWAL ALERT
export const sendAdminWithdrawAlert = internalAction({
  args: {
    adminEmails: v.array(v.string()),
    userName: v.string(),
    userPhone: v.string(),
    userCountry: v.string(),
    amount: v.number(),
    currency: v.string(),
    method: v.string()
  },
  handler: async (ctx, { adminEmails, userName, userPhone, userCountry, amount, currency, method }) => {
    const resend = new Resend(process.env.AUTH_RESEND_KEY!);

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: adminEmails,
        subject: `🚨 New Withdrawal Request: ${currency} ${amount.toLocaleString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #112a46; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #f97316;">New Pending Withdrawal</h2>
            <p>A user has just requested a payout. Here are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>User:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${userName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Country:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${userCountry}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone/Account:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${userPhone}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #1abc9c; font-weight: bold;">${currency} ${amount.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Method:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${method}</td></tr>
            </table>
            <br/>
            <a href="https://flexqash.com/admin/withdrawals" style="background-color: #112a46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Review in Admin Panel</a>
          </div>
        `
      });
    } catch (error) {
      console.error("Failed to send admin alert email:", error);
    }
  }
});