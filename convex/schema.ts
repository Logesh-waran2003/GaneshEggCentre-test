import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    name: v.string(),
    type: v.union(v.literal("vendor"), v.literal("customer")),
    phone: v.optional(v.string()),
    currentBalance: v.number(),
    priceAdjustment: v.number(),
  }).index("by_type", ["type"]),

  products: defineTable({
    name: v.string(),
    eggsPerTray: v.number(),
    currentStockQtyTrays: v.number(),
    currentStockQtyLoose: v.number(),
  }),

  dailyBoardRates: defineTable({
    date: v.number(),
    productId: v.id("products"),
    ratePerEgg: v.number(),
    ratePerTray: v.number(),
  }).index("by_date", ["date"]),

  users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("EMPLOYEE")),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  transactions: defineTable({
    contactId: v.id("contacts"),
    type: v.union(
      v.literal("SALE"),
      v.literal("PURCHASE"),
      v.literal("PAYMENT_IN"),
      v.literal("PAYMENT_OUT")
    ),
    amount: v.number(),
    date: v.number(),
    description: v.optional(v.string()),
    cashCollected: v.optional(v.number()),
    relatedTransactionId: v.optional(v.id("transactions")),
    createdBy: v.optional(v.id("users")),
  }).index("by_contactId", ["contactId"]),

  transactionItems: defineTable({
    transactionId: v.id("transactions"),
    productId: v.id("products"),
    qtyTrays: v.number(),
    qtyLoose: v.number(),
    rateApplied: v.number(),
    breakageQty: v.number(),
  }).index("by_transactionId", ["transactionId"]),

  stockChecks: defineTable({
    date: v.number(),
    type: v.union(v.literal("MORNING"), v.literal("EVENING")),
    productId: v.id("products"),
    systemQtyTrays: v.number(),
    systemQtyLoose: v.number(),
    physicalQtyTrays: v.number(),
    physicalQtyLoose: v.number(),
    varianceTrays: v.number(),
    varianceLoose: v.number(),
    remarks: v.optional(v.string()),
  }).index("by_date", ["date"]),
});
