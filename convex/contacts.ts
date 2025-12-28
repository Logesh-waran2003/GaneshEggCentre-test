import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getContacts = query({
  args: {
    type: v.optional(v.union(v.literal("vendor"), v.literal("customer"))),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("contacts")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("contacts").collect();
  },
});

export const getContactById = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createContact = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("vendor"), v.literal("customer")),
    phone: v.optional(v.string()),
    priceAdjustment: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contacts", {
      name: args.name,
      type: args.type,
      phone: args.phone,
      currentBalance: 0,
      priceAdjustment: args.priceAdjustment ?? 0,
    });
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    priceAdjustment: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const updateBalance = mutation({
  args: { contactId: v.id("contacts"), amount: v.number() },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("Contact not found");
    await ctx.db.patch(args.contactId, {
      currentBalance: (contact.currentBalance ?? 0) + args.amount,
    });
  },
});
