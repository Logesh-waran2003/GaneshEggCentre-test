import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentStock = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const performStockCheck = mutation({
  args: {
    type: v.union(v.literal("MORNING"), v.literal("EVENING")),
    checks: v.array(
      v.object({
        productId: v.id("products"),
        physicalQtyTrays: v.number(),
        physicalQtyLoose: v.number(),
        remarks: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const check of args.checks) {
      const product = await ctx.db.get(check.productId);
      if (!product) continue;

      const varianceTrays = check.physicalQtyTrays - product.currentStockQtyTrays;
      const varianceLoose = check.physicalQtyLoose - product.currentStockQtyLoose;

      // Record the check
      await ctx.db.insert("stockChecks", {
        date: now,
        type: args.type,
        productId: check.productId,
        systemQtyTrays: product.currentStockQtyTrays,
        systemQtyLoose: product.currentStockQtyLoose,
        physicalQtyTrays: check.physicalQtyTrays,
        physicalQtyLoose: check.physicalQtyLoose,
        varianceTrays,
        varianceLoose,
        remarks: check.remarks,
      });

      // Update stock to match physical count
      await ctx.db.patch(check.productId, {
        currentStockQtyTrays: check.physicalQtyTrays,
        currentStockQtyLoose: check.physicalQtyLoose,
      });
    }

    return { success: true };
  },
});
