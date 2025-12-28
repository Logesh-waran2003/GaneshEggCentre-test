import { mutation } from "./_generated/server";

export const seed = mutation({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    if (products.length > 0) return;

    await ctx.db.insert("products", {
      name: "White Large",
      currentStockQtyTrays: 100,
      currentStockQtyLoose: 0,
    });
    await ctx.db.insert("products", {
      name: "White Medium",
      currentStockQtyTrays: 80,
      currentStockQtyLoose: 0,
    });
    await ctx.db.insert("products", {
      name: "Brown Large",
      currentStockQtyTrays: 50,
      currentStockQtyLoose: 0,
    });
    await ctx.db.insert("products", {
      name: "Brown Medium",
      currentStockQtyTrays: 40,
      currentStockQtyLoose: 0,
    });
  },
});
