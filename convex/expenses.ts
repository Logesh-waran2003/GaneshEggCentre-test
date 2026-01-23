import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hasFeature } from "./featureFlags";

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

export const createExpense = mutation({
  args: {
    token: v.string(),
    amount: v.number(),
    date: v.number(),
    description: v.string(),
    employeeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    if (args.employeeId) {
      const employee = await ctx.db.get(args.employeeId);
      if (!employee || !employee.isActive) {
        throw new Error("Invalid employee");
      }
    }

    return await ctx.db.insert("expenses", {
      amount: args.amount,
      date: args.date,
      description: args.description,
      createdBy: user._id,
      employeeId: args.employeeId,
      createdAt: Date.now(),
    });
  },
});

export const listExpenses = query({
  args: {
    token: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    employeeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);

    let expenses;
    
    // Filter by employee if specified or if user can only view own expenses
    if (args.employeeId) {
      expenses = await ctx.db
        .query("expenses")
        .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
        .collect();
    } else if (!hasFeature("viewAllExpenses", user.role)) {
      // Employees can only see their own expenses
      expenses = await ctx.db
        .query("expenses")
        .withIndex("by_employee", (q) => q.eq("employeeId", user._id))
        .collect();
    } else {
      expenses = await ctx.db.query("expenses").collect();
    }

    if (args.startDate) {
      expenses = expenses.filter((e) => e.date >= args.startDate!);
    }
    if (args.endDate) {
      expenses = expenses.filter((e) => e.date <= args.endDate!);
    }

    const employeeIds = [...new Set(expenses.map(e => e.employeeId).filter(Boolean))];
    const employees = await Promise.all(employeeIds.map(id => ctx.db.get(id as any)));
    const employeeMap: Record<string, string> = {};
    employees.filter(Boolean).forEach(e => {
      if (e && 'name' in e) {
        employeeMap[e._id] = e.name as string;
      }
    });

    return expenses
      .map(expense => ({
        ...expense,
        employeeName: expense.employeeId ? employeeMap[expense.employeeId] : null,
      }))
      .sort((a, b) => b.date - a.date);
  },
});

export const getEmployeeExpenses = query({
  args: {
    employeeId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    return expenses;
  },
});

export const deleteExpense = mutation({
  args: {
    token: v.string(),
    expenseId: v.id("expenses"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx, args.token);
    
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Check feature flags
    const canDeleteAny = hasFeature("deleteAnyExpense", user.role);
    const canDeleteOwn = hasFeature("deleteOwnExpense", user.role);
    const isOwnExpense = expense.employeeId === user._id;

    if (!canDeleteAny && !(canDeleteOwn && isOwnExpense)) {
      throw new Error("Not authorized to delete this expense");
    }

    await ctx.db.delete(args.expenseId);
  },
});

export const getDailyTotal = query({
  args: {
    date: v.number(),
    employeeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    let expenses = await ctx.db
      .query("expenses")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startOfDay.getTime()),
          q.lte(q.field("date"), endOfDay.getTime())
        )
      )
      .collect();

    if (args.employeeId) {
      expenses = expenses.filter((e) => e.employeeId === args.employeeId);
    }

    return expenses.reduce((sum, e) => sum + e.amount, 0);
  },
});
