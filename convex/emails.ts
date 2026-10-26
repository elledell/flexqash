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
            <h2 style="color: #3b82f6;">Welcome to FlexQash, ${name}!</h2>
            <p>Great news! Your account has been officially activated by our administration team.</p>
            <p>You can now log in to your dashboard, start investing, apply for gigs, and share your referral code to earn commissions.</p>
            <br/>
            <a href="https://flexqash.com/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
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
  args: { 
    email: v.string(), 
    name: v.string(), 
    amount: v.number(), // This is now the Gross Amount (e.g., 435 KES or 19000 MWK)
    fee: v.number(),    // The transaction fee (e.g., 35 KES or 2000 MWK)
    netAmount: v.number(), // The exact amount sent to the user (e.g., 400 KES or 17000 MWK)
    currency: v.string(),
  },
  handler: async (ctx, { email, name, amount, fee, netAmount, currency }) => {
    const resend = new Resend(process.env.AUTH_RESEND_KEY!);

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: "Withdrawal Confirmation ✅",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <!-- FlexQash Light Blue Header -->
            <div style="background-color: #3b82f6; padding: 30px 20px; text-align: center;">
              <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">FlexQash Withdrawal Confirmation</h2>
              <p style="margin: 8px 0 0 0; color: #eff6ff; font-size: 14px; font-weight: 500;">✔ Withdrawal Successfully Completed</p>
            </div>
            
            <!-- Body Content -->
            <div style="padding: 30px 25px;">
              <p style="margin: 0 0 15px 0; font-size: 16px;">Dear <strong>${name}</strong>,</p>
              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">
                Your withdrawal has been <span style="color: #2563eb; font-weight: bold;">successfully completed</span>.
              </p>
              <p style="margin: 0 0 15px 0; font-size: 15px;">Below are the details of your transaction:</p>
              
              <!-- Soft Blue Table Box -->
              <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #dbeafe; color: #4b5563;">Amount</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #dbeafe; text-align: right; font-weight: bold; color: #1f2937;">${currency} ${amount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #dbeafe; color: #4b5563;">Fee</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #dbeafe; text-align: right; font-weight: bold; color: #1f2937;">${currency} ${fee.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #dbeafe; color: #4b5563;">Net Amount</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #dbeafe; text-align: right; font-weight: bold; color: #2563eb;">${currency} ${netAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #4b5563;">Status</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #1f2937;">COMPLETED</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">Thank you for using FlexQash.</p>
            </div>
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
            <h2 style="color: #3b82f6;">Congratulations! 🎉</h2>
            <p>Hello ${name},</p>
            <p>You have just earned <strong>${currency} ${amount.toLocaleString()}</strong> from a Level ${level} referral!</p>
            <p>This commission was instantly added to your wallet because <strong>${fromUsername}</strong> just joined and activated their account in your downline network.</p>
            <br/>
            <a href="https://flexqash.com/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View My Wallet</a>
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
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #3b82f6; font-weight: bold;">${currency} ${amount.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Method:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${method}</td></tr>
            </table>
            <br/>
            <a href="https://flexqash.com/admin/withdrawals" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Review in Admin Panel</a>
          </div>
        `
      });
    } catch (error) {
      console.error("Failed to send admin alert email:", error);
    }
  }
});