import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "./_generated/server";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Please sign in.");
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("Account not found.");
  return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "admin") throw new ConvexError("Not authorized.");
  return user;
}

// Call this at the top of any query that returns course content
export async function requireActiveMember(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "admin" && user.membership !== "active") {
    throw new ConvexError("Membership required.");
  }
  return user;
}