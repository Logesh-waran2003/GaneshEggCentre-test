import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db.get(session.userId);
  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }

  return user;
}

export const createUser = mutation({
  args: {
    token: v.string(),
    username: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("EMPLOYEE")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existing) {
      throw new Error("Username already exists");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      username: args.username,
      passwordHash,
      name: args.name,
      role: args.role,
      isActive: true,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const listActiveEmployees = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.isActive)
      .map((u) => ({ _id: u._id, name: u.name, role: u.role }));
  },
});

export const listUsers = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      username: u.username,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));
  },
});

export const toggleUserActive = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      isActive: !user.isActive,
    });
  },
});
