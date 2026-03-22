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
    neccRatePerEgg: v.optional(v.number()),
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
    contactId: v.optional(v.id("contacts")),
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
    salesTripId: v.optional(v.id("saleTrips")),
  }).index("by_contactId", ["contactId"]),

  saleTrips: defineTable({
    date: v.number(),
    employees: v.array(v.id("users")),
    createdBy: v.id("users"),
    status: v.union(
      v.literal("PENDING_APPROVAL"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("APPROVED")
    ),
    productId: v.optional(v.id("products")),
    loadedQtyTrays: v.optional(v.number()),
    loadedQtyLoose: v.optional(v.number()),
    soldQtyTrays: v.optional(v.number()),
    soldQtyLoose: v.optional(v.number()),
    returnedQtyTrays: v.optional(v.number()),
    returnedQtyLoose: v.optional(v.number()),
    damagedQtyTrays: v.optional(v.number()),
    damagedQtyLoose: v.optional(v.number()),
    totalCashCollected: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

  tripProducts: defineTable({
    tripId: v.id("saleTrips"),
    productId: v.id("products"),
    loadedQtyTrays: v.number(),
    loadedQtyLoose: v.number(),
    soldQtyTrays: v.number(),
    soldQtyLoose: v.number(),
    returnedQtyTrays: v.number(),
    returnedQtyLoose: v.number(),
    damagedQtyTrays: v.number(),
    damagedQtyLoose: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_tripId_productId", ["tripId", "productId"]),

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

  expenses: defineTable({
    amount: v.number(),
    date: v.number(),
    description: v.string(),
    createdBy: v.id("users"),
    employeeId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_employee", ["employeeId"]),

  tripExpenses: defineTable({
    tripId: v.id("saleTrips"),
    amount: v.number(),
    description: v.string(),
    employeeId: v.id("users"),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_employee", ["employeeId"]),
});
