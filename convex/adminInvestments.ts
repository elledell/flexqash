import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Security helper: Ensure only admins can access these endpoints
async function enforceAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new ConvexError("Unauthorized: Admin access required");
  return user;
}

// Get ALL packages (including hidden/inactive ones)
export const getAllPackages = query({
  args: {},
  handler: async (ctx) => {
    await enforceAdmin(ctx);
    return await ctx.db.query("investmentPackages").order("desc").collect();
  },
});

// Create a new investment package
export const createPackage = mutation({
  args: {
    name: v.string(),
    cost: v.number(),
    dailyRoi: v.number(),
    durationDays: v.number(),
  },
  handler: async (ctx, args) => {
    await enforceAdmin(ctx);
    await ctx.db.insert("investmentPackages", {
      name: args.name,
      cost: args.cost,
      dailyRoi: args.dailyRoi,
      durationDays: args.durationDays,
      isActive: true, // New packages are active by default
    });
  },
});

// Toggle a package on/off (so nobody can buy it anymore)
export const togglePackageStatus = mutation({
  args: { packageId: v.id("investmentPackages"), currentStatus: v.boolean() },
  handler: async (ctx, args) => {
    await enforceAdmin(ctx);
    await ctx.db.patch(args.packageId, { isActive: !args.currentStatus });
  },
});