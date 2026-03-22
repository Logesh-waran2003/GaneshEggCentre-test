import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireAuth(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db.get(session.userId);
  if (!user || !user.isActive) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function requireAdmin(ctx: any, token: string) {
  const user = await requireAuth(ctx, token);
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return user;
}

export const createTrip = mutation({
  args: {
    token: v.string(),
    employees: v.array(v.id("users")),
    products: v.array(v.object({
      productId: v.id("products"),
      loadedQtyTrays: v.number(),
      loadedQtyLoose: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    const tripId = await ctx.db.insert("saleTrips", {
      date: Date.now(),
      employees: args.employees,
      createdBy: user._id,
      status: "PENDING_APPROVAL",
      totalCashCollected: 0,
    });

    for (const p of args.products) {
      await ctx.db.insert("tripProducts", {
        tripId,
        productId: p.productId,
        loadedQtyTrays: p.loadedQtyTrays,
        loadedQtyLoose: p.loadedQtyLoose,
        soldQtyTrays: 0,
        soldQtyLoose: 0,
        returnedQtyTrays: 0,
        returnedQtyLoose: 0,
        damagedQtyTrays: 0,
        damagedQtyLoose: 0,
      });
    }

    return tripId;
  },
});

export const approveStartTrip = mutation({
  args: {
    token: v.string(),
    tripId: v.id("saleTrips"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.status !== "PENDING_APPROVAL") throw new Error("Trip already started");

    const tripProducts = await ctx.db
      .query("tripProducts")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    for (const tp of tripProducts) {
      const product = await ctx.db.get(tp.productId);
      if (!product) throw new Error(`Product not found`);

      if (product.currentStockQtyTrays < tp.loadedQtyTrays) {
        throw new Error(`Insufficient stock (trays) for ${product.name}`);
      }
      if (product.currentStockQtyLoose < tp.loadedQtyLoose) {
        throw new Error(`Insufficient stock (loose) for ${product.name}`);
      }

      await ctx.db.patch(tp.productId, {
        currentStockQtyTrays: product.currentStockQtyTrays - tp.loadedQtyTrays,
        currentStockQtyLoose: product.currentStockQtyLoose - tp.loadedQtyLoose,
      });
    }

    await ctx.db.patch(args.tripId, {
      status: "IN_PROGRESS",
      startedAt: Date.now(),
    });
  },
});

export const completeTrip = mutation({
  args: {
    token: v.string(),
    tripId: v.id("saleTrips"),
    returns: v.array(v.object({
      productId: v.id("products"),
      returnedQtyTrays: v.number(),
      returnedQtyLoose: v.number(),
      damagedQtyTrays: v.number(),
      damagedQtyLoose: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.status !== "IN_PROGRESS") throw new Error("Trip not in progress");
    if (!trip.employees.includes(user._id)) {
      throw new Error("Only assigned employees can complete this trip");
    }

    const tripProducts = await ctx.db
      .query("tripProducts")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const sales = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("salesTripId"), args.tripId))
      .collect();

    let cashCollected = 0;
    for (const sale of sales) {
      cashCollected += sale.cashCollected || 0;
    }

    for (const tp of tripProducts) {
      let soldTrays = 0;
      let soldLoose = 0;

      for (const sale of sales) {
        const items = await ctx.db
          .query("transactionItems")
          .withIndex("by_transactionId", (q) => q.eq("transactionId", sale._id))
          .collect();
        for (const item of items) {
          if (item.productId === tp.productId) {
            soldTrays += item.qtyTrays;
            soldLoose += item.qtyLoose;
          }
        }
      }

      const ret = args.returns.find((r) => r.productId === tp.productId);
      await ctx.db.patch(tp._id, {
        soldQtyTrays: soldTrays,
        soldQtyLoose: soldLoose,
        returnedQtyTrays: ret?.returnedQtyTrays ?? 0,
        returnedQtyLoose: ret?.returnedQtyLoose ?? 0,
        damagedQtyTrays: ret?.damagedQtyTrays ?? 0,
        damagedQtyLoose: ret?.damagedQtyLoose ?? 0,
      });
    }

    await ctx.db.patch(args.tripId, {
      status: "COMPLETED",
      completedAt: Date.now(),
      totalCashCollected: cashCollected,
    });
  },
});

export const approveEndTrip = mutation({
  args: {
    token: v.string(),
    tripId: v.id("saleTrips"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.status !== "COMPLETED") throw new Error("Trip not completed yet");

    const tripProducts = await ctx.db
      .query("tripProducts")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    for (const tp of tripProducts) {
      const product = await ctx.db.get(tp.productId);
      if (!product) continue;

      await ctx.db.patch(tp.productId, {
        currentStockQtyTrays: product.currentStockQtyTrays + tp.returnedQtyTrays + tp.damagedQtyTrays,
        currentStockQtyLoose: product.currentStockQtyLoose + tp.returnedQtyLoose + tp.damagedQtyLoose,
      });
    }

    await ctx.db.patch(args.tripId, {
      status: "APPROVED",
      approvedAt: Date.now(),
      approvedBy: admin._id,
    });
  },
});

export const getTodayTrips = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfToday = now.getTime();

    const allTrips = await ctx.db
      .query("saleTrips")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("date"), startOfToday))
      .collect();

    const trips = user.role === "ADMIN"
      ? allTrips
      : allTrips.filter((t) => t.employees.includes(user._id));

    const result = [];
    for (const trip of trips) {
      const tripProducts = await ctx.db
        .query("tripProducts")
        .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
        .collect();

      const productsWithNames = await Promise.all(
        tripProducts.map(async (tp) => {
          const product = await ctx.db.get(tp.productId);
          return { ...tp, productName: product?.name ?? "Unknown" };
        })
      );

      const employeeDetails = await Promise.all(
        trip.employees.map((id) => ctx.db.get(id))
      );

      result.push({ ...trip, tripProducts: productsWithNames, employeeDetails });
    }

    return result;
  },
});

export const getTripDetails = query({
  args: { token: v.string(), tripId: v.id("saleTrips") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    if (user.role !== "ADMIN" && !trip.employees.includes(user._id)) {
      throw new Error("Unauthorized");
    }

    const tripProducts = await ctx.db
      .query("tripProducts")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const productsWithNames = await Promise.all(
      tripProducts.map(async (tp) => {
        const product = await ctx.db.get(tp.productId);
        return { ...tp, productName: product?.name ?? "Unknown", eggsPerTray: product?.eggsPerTray ?? 30 };
      })
    );

    const employeeDetails = await Promise.all(
      trip.employees.map((id) => ctx.db.get(id))
    );

    const sales = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("salesTripId"), args.tripId))
      .collect();

    const salesWithDetails = [];
    for (const sale of sales) {
      const contact = sale.contactId ? await ctx.db.get(sale.contactId) : null;
      const items = await ctx.db
        .query("transactionItems")
        .withIndex("by_transactionId", (q) => q.eq("transactionId", sale._id))
        .collect();
      salesWithDetails.push({ ...sale, contact, items });
    }

    return { ...trip, tripProducts: productsWithNames, employeeDetails, sales: salesWithDetails };
  },
});

export const getActiveTrips = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    const allTrips = await ctx.db
      .query("saleTrips")
      .withIndex("by_status", (q) => q.eq("status", "IN_PROGRESS"))
      .collect();

    const trips = user.role === "ADMIN"
      ? allTrips
      : allTrips.filter((t) => t.employees.includes(user._id));

    const result = [];
    for (const trip of trips) {
      const tripProducts = await ctx.db
        .query("tripProducts")
        .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
        .collect();

      const productsWithNames = await Promise.all(
        tripProducts.map(async (tp) => {
          const product = await ctx.db.get(tp.productId);
          return { ...tp, productName: product?.name ?? "Unknown" };
        })
      );

      result.push({ ...trip, tripProducts: productsWithNames });
    }

    return result;
  },
});
