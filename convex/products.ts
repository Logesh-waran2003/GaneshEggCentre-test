import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    eggsPerTray: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      name: args.name,
      eggsPerTray: args.eggsPerTray,
      currentStockQtyTrays: 0,
      currentStockQtyLoose: 0,
    });
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    eggsPerTray: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      eggsPerTray: args.eggsPerTray,
    });
  },
});

export const deleteProduct = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
