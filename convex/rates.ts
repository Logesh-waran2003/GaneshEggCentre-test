import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getTodayRates = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfToday = now.getTime();

    return await ctx.db
      .query("dailyBoardRates")
      .withIndex("by_date", (q) => q.gte("date", startOfToday))
      .collect();
  },
});

export const setDailyRate = mutation({
  args: { eggType: v.string(), rate: v.number() },
  handler: async (ctx, args) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfToday = now.getTime();

    const existing = await ctx.db
      .query("dailyBoardRates")
      .withIndex("by_date", (q) => q.gte("date", startOfToday))
      .filter((q) => q.eq(q.field("eggType"), args.eggType))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ratePerEgg: args.rate });
    } else {
      await ctx.db.insert("dailyBoardRates", {
        date: startOfToday,
        eggType: args.eggType,
        ratePerEgg: args.rate,
      });
    }
    return { success: true };
  },
});
