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

export const addTripExpense = mutation({
  args: {
    token: v.string(),
    tripId: v.id("saleTrips"),
    amount: v.number(),
    description: v.string(),
    employeeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "IN_PROGRESS") {
      throw new Error("Can only add expenses to trips in progress");
    }

    if (!trip.employees.includes(args.employeeId)) {
      throw new Error("Employee not part of this trip");
    }

    return await ctx.db.insert("tripExpenses", {
      tripId: args.tripId,
      amount: args.amount,
      description: args.description,
      employeeId: args.employeeId,
      createdBy: user._id,
      createdAt: Date.now(),
    });
  },
});

export const getTripExpenses = query({
  args: { tripId: v.id("saleTrips") },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const employeeIds = [...new Set(expenses.map(e => e.employeeId))];
    const employees = await Promise.all(employeeIds.map(id => ctx.db.get(id)));
    const employeeMap = Object.fromEntries(
      employees.filter(Boolean).map(e => [e!._id, e!.name])
    );

    return expenses.map(expense => ({
      ...expense,
      employeeName: employeeMap[expense.employeeId],
    }));
  },
});

export const getTripExpensesByEmployee = query({
  args: {
    tripId: v.id("saleTrips"),
    employeeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("employeeId"), args.employeeId))
      .collect();

    return expenses;
  },
});

export const getTripProfitability = query({
  args: { tripId: v.id("saleTrips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    const expenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byEmployee: Record<string, { name: string; expenses: number }> = {};
    for (const expense of expenses) {
      const employee = await ctx.db.get(expense.employeeId);
      if (employee) {
        if (!byEmployee[expense.employeeId]) {
          byEmployee[expense.employeeId] = { name: employee.name, expenses: 0 };
        }
        byEmployee[expense.employeeId].expenses += expense.amount;
      }
    }

    return {
      totalCash: trip.totalCashCollected,
      totalExpenses,
      profit: trip.totalCashCollected - totalExpenses,
      byEmployee,
    };
  },
});

export const deleteTripExpense = mutation({
  args: {
    token: v.string(),
    expenseId: v.id("tripExpenses"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);
    
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const trip = await ctx.db.get(expense.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "IN_PROGRESS") {
      throw new Error("Can only delete expenses from trips in progress");
    }

    if (user.role !== "ADMIN" && expense.createdBy !== user._id) {
      throw new Error("Not authorized to delete this expense");
    }

    await ctx.db.delete(args.expenseId);
  },
});
