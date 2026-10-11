import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      country: user.country,
      currency: user.currency,
      role: user.role ?? "member",
      membershipActive: user.membership === "active",
    };
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const user = await ctx.db.get(userId);
    if (!user) return null;

    let inviterUsername = "None";
    if (user.invitedBy) {
      const inviter = await ctx.db.get(user.invitedBy);
      if (inviter) {
        inviterUsername = inviter.username || inviter.name || "Unknown";
      }
    }

    return {
      name: user.name || "N/A",
      username: user.username || "N/A",
      email: user.email || "N/A",
      phone: user.phone || "N/A",
      country: user.country || "N/A",
      invitedBy: inviterUsername,
      status: user.membership === "active" ? "Active" : "Inactive",
      joinDate: user._creationTime,
    };
  },
});

// Pre-check uniqueness before Sign Up
export const validateSignUpAvailability = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, { username, email, phone }) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check Username
    let existingUsername = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", cleanUsername))
      .first();

    // Fallback check in case older accounts had mixed-case usernames
    if (!existingUsername) {
      const allUsers = await ctx.db.query("users").collect();
      existingUsername = allUsers.find((u) => (u.username || "").toLowerCase() === cleanUsername) ?? null;
    }

    if (existingUsername) {
      throw new ConvexError("This username is already taken. Please choose another one.");
    }

    // Check Email
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", cleanEmail))
      .first();

    if (existingEmail) {
      throw new ConvexError("An account with this email already exists.");
    }

    // Check Phone Number
    const existingPhone = await ctx.db
      .query("users")
      .withIndex("phone", (q) => q.eq("phone", cleanPhone))
      .first();

    if (existingPhone) {
      throw new ConvexError("This mobile number is already registered to another account.");
    }

    return { available: true };
  },
});

// Resolve Username or Email for Sign In
export const resolveLoginIdentifier = mutation({
  args: {
    identifier: v.string(),
  },
  handler: async (ctx, { identifier }) => {
    const clean = identifier.trim().toLowerCase();

    // If it contains '@', treat it directly as an email
    if (clean.includes("@")) {
      return clean;
    }

    // Otherwise, look up the user by their username
    let user = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", clean))
      .first();

    // Fallback search in case older accounts had mixed-case usernames
    if (!user) {
      const allUsers = await ctx.db.query("users").collect();
      user = allUsers.find((u) => (u.username || "").toLowerCase() === clean) ?? null;
    }

    if (!user || !user.email) {
      throw new ConvexError("Invalid username/email or password.");
    }

    return user.email.toLowerCase();
  },
});