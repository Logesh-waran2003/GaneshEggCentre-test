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
    currentStockQtyTrays: v.number(),
    currentStockQtyLoose: v.number(),
  }),

  dailyBoardRates: defineTable({
    date: v.number(), // timestamp
    eggType: v.string(),
    ratePerEgg: v.number(),
  }).index("by_date", ["date"]),

  transactions: defineTable({
    contactId: v.id("contacts"),
    type: v.union(
      v.literal("SALE"),
      v.literal("PURCHASE"),
      v.literal("PAYMENT_IN"),
      v.literal("PAYMENT_OUT")
    ),
    amount: v.number(),
    date: v.number(), // timestamp
    description: v.optional(v.string()),
  }).index("by_contactId", ["contactId"]),

  transactionItems: defineTable({
    transactionId: v.id("transactions"),
    productId: v.id("products"),
    qtyTrays: v.number(),
    qtyLoose: v.number(),
    rateApplied: v.number(),
    breakageQty: v.number(),
  }).index("by_transactionId", ["transactionId"]),
});
