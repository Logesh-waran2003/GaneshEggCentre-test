import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTransaction = mutation({
  args: {
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
    salesTripId: v.optional(v.id("saleTrips")),
    items: v.optional(
      v.array(
        v.object({
          productId: v.id("products"),
          qtyTrays: v.number(),
          qtyLoose: v.number(),
          rateApplied: v.number(),
          breakageQty: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    console.log("createTransaction called with:", {
      type: args.type,
      amount: args.amount,
      cashCollected: args.cashCollected,
    });

    // 1. Create Sale Transaction
    const transactionId = await ctx.db.insert("transactions", {
      contactId: args.contactId,
      type: args.type,
      amount: args.amount,
      date: args.date,
      description: args.description,
      cashCollected: args.cashCollected,
      salesTripId: args.salesTripId,
    });
    console.log("Created transaction:", transactionId);

    // 2. If cash collected, create separate PAYMENT_IN transaction
    if (args.type === "SALE" && args.cashCollected && args.cashCollected > 0) {
      console.log("Creating PAYMENT_IN for cash:", args.cashCollected);
      const paymentId = await ctx.db.insert("transactions", {
        contactId: args.contactId,
        type: "PAYMENT_IN",
        amount: args.cashCollected,
        date: args.date,
        description: `Cash collected for sale`,
        relatedTransactionId: transactionId,
      });
      console.log("Created PAYMENT_IN transaction:", paymentId);
    }

    // 3. Handle Items and Stock
    if (args.items) {
      // First validate stock for SALE transactions
      if (args.type === "SALE") {
        for (const item of args.items) {
          const product = await ctx.db.get(item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          
          const availableTrays = product.currentStockQtyTrays;
          const availableLoose = product.currentStockQtyLoose;
          
          if (item.qtyTrays > availableTrays) {
            throw new Error(
              `Insufficient stock for ${product.name}: Need ${item.qtyTrays} trays, only ${availableTrays} available`
            );
          }
          
          if (item.qtyLoose > availableLoose) {
            throw new Error(
              `Insufficient stock for ${product.name}: Need ${item.qtyLoose} loose eggs, only ${availableLoose} available`
            );
          }
        }
      }

      // Now process items and update stock
      for (const item of args.items) {
        await ctx.db.insert("transactionItems", {
          transactionId,
          productId: item.productId,
          qtyTrays: item.qtyTrays,
          qtyLoose: item.qtyLoose,
          rateApplied: item.rateApplied,
          breakageQty: item.breakageQty,
        });

        // Update Stock
        const product = await ctx.db.get(item.productId);
        if (product) {
          const stockChangeTrays =
            args.type === "PURCHASE" ? item.qtyTrays : -item.qtyTrays;
          const stockChangeLoose =
            args.type === "PURCHASE" ? item.qtyLoose : -item.qtyLoose;

          await ctx.db.patch(item.productId, {
            currentStockQtyTrays:
              (product.currentStockQtyTrays ?? 0) + stockChangeTrays,
            currentStockQtyLoose:
              (product.currentStockQtyLoose ?? 0) +
              stockChangeLoose -
              (item.breakageQty ?? 0),
          });
        }
      }
    }

    // 4. Update Contact Balance
    const contact = await ctx.db.get(args.contactId);
    if (contact) {
      let balanceChange = 0;
      
      if (args.type === "SALE") {
        // For sales: only add credit amount (total - cash collected)
        const creditAmount = args.cashCollected 
          ? args.amount - args.cashCollected 
          : args.amount;
        balanceChange = creditAmount;
      } else if (args.type === "PURCHASE") {
        balanceChange = -args.amount;
      } else if (args.type === "PAYMENT_IN") {
        balanceChange = -args.amount;
      } else if (args.type === "PAYMENT_OUT") {
        balanceChange = args.amount;
      }

      await ctx.db.patch(args.contactId, {
        currentBalance: (contact.currentBalance ?? 0) + balanceChange,
      });
    }

    return transactionId;
  },
});

export const getContactTransactions = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_contactId", (q) => q.eq("contactId", args.contactId))
      .order("desc")
      .collect();

    const result = [];
    for (const tx of transactions) {
      const items = await ctx.db
        .query("transactionItems")
        .withIndex("by_transactionId", (q) => q.eq("transactionId", tx._id))
        .collect();

      const itemsWithProduct = [];
      for (const item of items) {
        const product = await ctx.db.get(item.productId);
        itemsWithProduct.push({ ...item, product });
      }

      result.push({ ...tx, items: itemsWithProduct });
    }
    return result;
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfToday = now.getTime();

    const todaySales = await ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "SALE"),
          q.gte(q.field("date"), startOfToday)
        )
      )
      .collect();

    const todayPayments = await ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "PAYMENT_IN"),
          q.gte(q.field("date"), startOfToday)
        )
      )
      .collect();

    const totalSalesAmount = todaySales.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    const totalPaymentsAmount = todayPayments.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    let totalTraysSold = 0;
    for (const sale of todaySales) {
      const items = await ctx.db
        .query("transactionItems")
        .withIndex("by_transactionId", (q) => q.eq("transactionId", sale._id))
        .collect();
      totalTraysSold += items.reduce((acc, curr) => acc + curr.qtyTrays, 0);
    }

    return {
      totalSalesAmount,
      totalPaymentsAmount,
      totalTraysSold,
      salesCount: todaySales.length,
    };
  },
});

export const getTransactionsByEmployee = query({
  args: {
    employeeId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("createdBy"), args.employeeId))
      .collect();

    if (args.startDate) {
      transactions = transactions.filter((t) => t.date >= args.startDate!);
    }
    if (args.endDate) {
      transactions = transactions.filter((t) => t.date <= args.endDate!);
    }

    return transactions;
  },
});
