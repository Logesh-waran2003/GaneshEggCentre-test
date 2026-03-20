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
    productId: v.id("products"),
    employees: v.array(v.id("users")),
    loadedQtyTrays: v.number(),
    loadedQtyLoose: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    const tripId = await ctx.db.insert("saleTrips", {
      date: Date.now(),
      employees: args.employees,
      createdBy: user._id,
      status: "PENDING_APPROVAL",
      productId: args.productId,
      loadedQtyTrays: args.loadedQtyTrays,
      loadedQtyLoose: args.loadedQtyLoose,
      soldQtyTrays: 0,
      soldQtyLoose: 0,
      returnedQtyTrays: 0,
      returnedQtyLoose: 0,
      damagedQtyTrays: 0,
      damagedQtyLoose: 0,
      totalCashCollected: 0,
    });

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

    const product = await ctx.db.get(trip.productId);
    if (!product) throw new Error("Product not found");

    if (product.currentStockQtyTrays < trip.loadedQtyTrays) {
      throw new Error("Insufficient stock (trays)");
    }
    if (product.currentStockQtyLoose < trip.loadedQtyLoose) {
      throw new Error("Insufficient stock (loose)");
    }

    await ctx.db.patch(trip.productId, {
      currentStockQtyTrays: product.currentStockQtyTrays - trip.loadedQtyTrays,
      currentStockQtyLoose: product.currentStockQtyLoose - trip.loadedQtyLoose,
    });

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
    returnedQtyTrays: v.number(),
    returnedQtyLoose: v.number(),
    damagedQtyTrays: v.number(),
    damagedQtyLoose: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.status !== "IN_PROGRESS") throw new Error("Trip not in progress");
    if (!trip.employees.includes(user._id)) {
      throw new Error("Only assigned employees can complete this trip");
    }

    const sales = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("salesTripId"), args.tripId))
      .collect();

    let soldTrays = 0;
    let soldLoose = 0;
    let cashCollected = 0;

    for (const sale of sales) {
      const items = await ctx.db
        .query("transactionItems")
        .withIndex("by_transactionId", (q) => q.eq("transactionId", sale._id))
        .collect();
      
      for (const item of items) {
        if (item.productId === trip.productId) {
          soldTrays += item.qtyTrays;
          soldLoose += item.qtyLoose;
        }
      }
      cashCollected += sale.cashCollected || 0;
    }

    await ctx.db.patch(args.tripId, {
      status: "COMPLETED",
      completedAt: Date.now(),
      soldQtyTrays: soldTrays,
      soldQtyLoose: soldLoose,
      returnedQtyTrays: args.returnedQtyTrays,
      returnedQtyLoose: args.returnedQtyLoose,
      damagedQtyTrays: args.damagedQtyTrays,
      damagedQtyLoose: args.damagedQtyLoose,
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

    const product = await ctx.db.get(trip.productId);
    if (!product) throw new Error("Product not found");

    await ctx.db.patch(trip.productId, {
      currentStockQtyTrays: product.currentStockQtyTrays + trip.returnedQtyTrays + trip.damagedQtyTrays,
      currentStockQtyLoose: product.currentStockQtyLoose + trip.returnedQtyLoose + trip.damagedQtyLoose,
    });

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
    await requireAuth(ctx, args.token);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfToday = now.getTime();

    const trips = await ctx.db
      .query("saleTrips")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("date"), startOfToday))
      .collect();

    const result = [];
    for (const trip of trips) {
      const product = await ctx.db.get(trip.productId);
      const employeeDetails = await Promise.all(
        trip.employees.map((id) => ctx.db.get(id))
      );
      result.push({ ...trip, product, employeeDetails });
    }

    return result;
  },
});

export const getTripDetails = query({
  args: { token: v.string(), tripId: v.id("saleTrips") },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    const product = await ctx.db.get(trip.productId);
    const employeeDetails = await Promise.all(
      trip.employees.map((id) => ctx.db.get(id))
    );

    const sales = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("salesTripId"), args.tripId))
      .collect();

    const salesWithDetails = [];
    for (const sale of sales) {
      const contact = await ctx.db.get(sale.contactId);
      const items = await ctx.db
        .query("transactionItems")
        .withIndex("by_transactionId", (q) => q.eq("transactionId", sale._id))
        .collect();
      salesWithDetails.push({ ...sale, contact, items });
    }

    return { ...trip, product, employeeDetails, sales: salesWithDetails };
  },
});

export const getActiveTrips = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token);

    const trips = await ctx.db
      .query("saleTrips")
      .withIndex("by_status", (q) => q.eq("status", "IN_PROGRESS"))
      .collect();

    const result = [];
    for (const trip of trips) {
      const product = await ctx.db.get(trip.productId);
      result.push({ ...trip, product });
    }

    return result;
  },
});
