/// <reference types="node" />
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
import { COUNTRIES } from "./countries";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      reset: ResendOTPPasswordReset,
      validatePasswordRequirements: (password: string) => {
        if (!password || password.length < 8) {
          throw new ConvexError("Password must be at least 8 characters.");
        }
      },
      // Runs on sign-up, sign-in and reset. Only sign-up has the extra fields.
      // Never accepts a role from the client.
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();

        // Sign-in and password reset only need the email
        if (params.flow !== "signUp") {
          return { email };
        }

        const username = String(params.username ?? "").trim();
        const phone = String(params.phone ?? "").trim();
        const country = COUNTRIES.find((c) => c.code === String(params.country));

        if (username.length < 3) throw new ConvexError("Username is too short.");
        if (!/^\+\d{8,15}$/.test(phone)) throw new ConvexError("Invalid mobile number.");
        if (!country) throw new ConvexError("Please choose a valid country.");
        if (params.password !== params.confirmPassword) {
          throw new ConvexError("Passwords do not match.");
        }

        return {
          email,
          name: username,
          username,
          phone,
          country: country.code,
          currency: country.currency,
        };
      },
    }),
  ],
  callbacks: {
    // Assign the role on the server, from the allowlist in Convex env settings
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (existingUserId) return;
      const user = await ctx.db.get(userId);
      const admins = (process.env.ADMIN_EMAILS ?? "")
        .toLowerCase()
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const isAdmin = !!user?.email && admins.includes(user.email.toLowerCase());
      await ctx.db.patch(userId, { role: isAdmin ? "admin" : "member" });
    },
  },
});