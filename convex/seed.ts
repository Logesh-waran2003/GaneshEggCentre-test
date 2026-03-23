import { mutation } from "./_generated/server";

export const seed = mutation({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    if (products.length > 0) return;

    await ctx.db.insert("products", {
      name: "White Large",
      eggsPerTray: 30,
      currentStockQtyTrays: 0,
      currentStockQtyLoose: 0,
    });
    await ctx.db.insert("products", {
      name: "White Medium",
      eggsPerTray: 30,
      currentStockQtyTrays: 0,
      currentStockQtyLoose: 0,
    });
    await ctx.db.insert("products", {
      name: "Brown Large",
      eggsPerTray: 30,
      currentStockQtyTrays: 0,
      currentStockQtyLoose: 0,
    });
    await ctx.db.insert("products", {
      name: "Brown Medium",
      eggsPerTray: 30,
      currentStockQtyTrays: 0,
      currentStockQtyLoose: 0,
    });
  },
});
