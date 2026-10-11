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
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();

        // Sign-in and password reset only need the email
        if (params.flow !== "signUp") {
          return { email };
        }

        // Normalize username to lowercase so "John" and "john" cannot collide
        const username = String(params.username ?? "").trim().toLowerCase();
        const phone = String(params.phone ?? "").trim();
        const country = COUNTRIES.find((c) => c.code === String(params.country));
        const invitedByCode = String(params.invitedByCode ?? "").trim().toLowerCase();

        if (username.length < 3) throw new ConvexError("Username must be at least 3 characters.");
        if (!/^[a-z0-9_]+$/.test(username)) {
          throw new ConvexError("Username can only contain letters, numbers, and underscores.");
        }
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
          // Temporarily stash the referral code if provided so callback can link it
          referralCode: invitedByCode || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (existingUserId) return;
      const user = await ctx.db.get(userId);
      if (!user) return;

      // 1. Server-side uniqueness safety net
      if (user.username) {
        const dupeUsername = await ctx.db
          .query("users")
          .filter((q) =>
            q.and(
              q.eq(q.field("username"), user.username),
              q.neq(q.field("_id"), userId)
            )
          )
          .first();
        if (dupeUsername) {
          throw new ConvexError("Username is already taken.");
        }
      }

      if (user.phone) {
        const dupePhone = await ctx.db
          .query("users")
          .filter((q) =>
            q.and(
              q.eq(q.field("phone"), user.phone),
              q.neq(q.field("_id"), userId)
            )
          )
          .first();
        if (dupePhone) {
          throw new ConvexError("Mobile number is already registered.");
        }
      }

      // 2. Link Uplink Referrer if an invite code/username was provided
      let invitedBy = undefined;
      if (user.referralCode) {
        const referrer = await ctx.db
          .query("users")
          .filter((q) =>
            q.and(
              q.eq(q.field("username"), user.referralCode),
              q.neq(q.field("_id"), userId)
            )
          )
          .first();
        if (referrer) {
          invitedBy = referrer._id;
        }
      }

      // 3. Assign Admin or Member role & finalize user record
      const admins = (process.env.ADMIN_EMAILS ?? "")
        .toLowerCase()
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const isAdmin = !!user.email && admins.includes(user.email.toLowerCase());

      await ctx.db.patch(userId, {
        role: isAdmin ? "admin" : "member",
        membership: "none",
        referralCode: user.username, // Set their own referral code to their unique username
        ...(invitedBy ? { invitedBy } : {}),
      });
    },
  },
});