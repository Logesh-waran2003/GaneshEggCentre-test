import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentStock = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const adjustStock = mutation({
  args: {
    token: v.string(),
    productId: v.id("products"),
    adjustTrays: v.number(),
    adjustLoose: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) throw new Error("Unauthorized");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const oldTrays = product.currentStockQtyTrays ?? 0;
    const oldLoose = product.currentStockQtyLoose ?? 0;

    let newTrays = oldTrays + args.adjustTrays;
    let newLoose = oldLoose + args.adjustLoose;

    if (newLoose < 0) {
      const traysNeeded = Math.ceil(-newLoose / product.eggsPerTray);
      newTrays -= traysNeeded;
      newLoose += traysNeeded * product.eggsPerTray;
    }

    await ctx.db.patch(args.productId, {
      currentStockQtyTrays: newTrays,
      currentStockQtyLoose: newLoose,
    });

    await ctx.db.insert("stockChecks", {
      date: Date.now(),
      type: "MORNING",
      productId: args.productId,
      systemQtyTrays: oldTrays,
      systemQtyLoose: oldLoose,
      physicalQtyTrays: newTrays,
      physicalQtyLoose: newLoose,
      varianceTrays: args.adjustTrays,
      varianceLoose: args.adjustLoose,
      remarks: args.reason,
    });

    return { success: true };
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

      await ctx.db.patch(check.productId, {
        currentStockQtyTrays: check.physicalQtyTrays,
        currentStockQtyLoose: check.physicalQtyLoose,
      });
    }

    return { success: true };
  },
});
