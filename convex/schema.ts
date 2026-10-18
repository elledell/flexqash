import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    username: v.optional(v.string()),
    country: v.optional(v.string()),
    currency: v.optional(v.string()),
    role: v.optional(v.union(v.literal("member"), v.literal("admin"))),
    membership: v.optional(v.union(v.literal("none"), v.literal("active"))),
    membershipPaidAt: v.optional(v.number()),
    isBanned: v.optional(v.boolean()),

    referralCode: v.optional(v.string()),
    invitedBy: v.optional(v.id("users")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("username", ["username"])
    .index("referralCode", ["referralCode"])
    .index("by_invitedBy", ["invitedBy"]),

  membershipPrices: defineTable({
    country: v.string(),
    currency: v.string(),
    amount: v.number(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_country", ["country"]),

  payments: defineTable({
    userId: v.id("users"),
    purpose: v.optional(v.union(v.literal("membership"), v.literal("deposit"))),
    provider: v.union(v.literal("mpesa"), v.literal("manual"), v.literal("selar"), v.literal("paystack")),
    amount: v.number(),
    currency: v.string(),
    phone: v.string(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("review")),
    methodTitle: v.optional(v.string()),
    transactionRef: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    checkoutRequestId: v.optional(v.string()),
    merchantRequestId: v.optional(v.string()),
    receipt: v.optional(v.string()),
    resultDesc: v.optional(v.string()),
  })
    .index("by_checkoutRequestId", ["checkoutRequestId"])
    .index("by_user", ["userId"]),

  earnings: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    source: v.union(
      v.literal("level_1"),
      v.literal("level_2"),
      v.literal("level_3"),
      v.literal("agent_bonus"),
      v.literal("trivia"),
      v.literal("deposit") 
    ),
    fromUserId: v.optional(v.id("users")),
    sourceCountry: v.optional(v.string()), 
    sourceUsername: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_source", ["userId", "source"]),

  withdrawals: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    fee: v.number(),
    netAmount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    method: v.string(),
    paymentDetails: v.string(),
    processedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  exchangeRates: defineTable({
    currency: v.string(), 
    rateToKES: v.number(), 
    updatedAt: v.number(),
  }).index("by_currency", ["currency"]),

  // ------------------------------------------------------------------
  // ISOLATED ECOSYSTEM
  // ------------------------------------------------------------------
  serviceEarnings: defineTable({
    userId: v.id("users"),
    amount: v.number(), 
    source: v.union(
      v.literal("investment"),
      v.literal("chat"),
      v.literal("ads"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("survey"),
      v.literal("blog"),
      v.literal("hotel_review")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_source", ["userId", "source"]),

    serviceWithdrawals: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    service: v.string(), // e.g., "chat", "youtube", "hotel_review"
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestedAt: v.number(),
  }).index("by_user", ["userId"]),

  investmentPackages: defineTable({
    name: v.string(),
    cost: v.number(), 
    dailyRoi: v.number(), 
    durationDays: v.number(),
    isActive: v.boolean(),
  }),

  activeInvestments: defineTable({
    userId: v.id("users"),
    packageId: v.id("investmentPackages"),
    investedAmount: v.number(), 
    dailyPayoutAmount: v.number(), 
    startDate: v.number(),
    endDate: v.number(),
    lastPayoutDate: v.number(), 
    status: v.union(v.literal("active"), v.literal("completed")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
    // Tracks event gig applications and bidding fees
  gigApplications: defineTable({
    userId: v.id("users"),
    gigId: v.string(), // Links to the static gig ID on the frontend
    bidCost: v.number(), // The fee deducted to apply
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    appliedAt: v.number(),
  })
    .index("by_user_gig", ["userId", "gigId"])
    .index("by_user", ["userId"]),

  // ------------------------------------------------------------------
  // HOTEL REVIEWS
  // ------------------------------------------------------------------
  hotelReviews: defineTable({
    userId: v.id("users"),
    hotelId: v.string(), // Changed to string for static IDs
    rating: v.number(),
    feedback: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_hotel", ["userId", "hotelId"])
    .index("by_hotel", ["hotelId"]),

  adminSettings: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),
});
