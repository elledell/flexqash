/// <reference types="node" />
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => (b % 10).toString()).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "FlexQash <support@send.flexqash.com>",
      to: [email],
      subject: "Reset your FlexQash password",
      text: `Your FlexQash password reset code is ${token}. It expires soon. If you didn't ask for this, ignore this email.`,
    });
    if (error) throw new Error("Could not send reset email");
  },
});