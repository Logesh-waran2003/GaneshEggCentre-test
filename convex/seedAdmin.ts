import { mutation } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const seedAdmin = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "admin"))
      .first();

    if (existing) {
      return { message: "Admin already exists" };
    }

    const passwordHash = await hashPassword("admin123");

    await ctx.db.insert("users", {
      username: "admin",
      passwordHash,
      name: "Administrator",
      role: "ADMIN",
      isActive: true,
      createdAt: Date.now(),
    });

    return { message: "Admin user created successfully. Username: admin, Password: admin123" };
  },
});

export const resetAdmin = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "admin"))
      .first();

    const passwordHash = await hashPassword("admin123");

    if (existing) {
      await ctx.db.patch(existing._id, { passwordHash });
      return { message: "Admin password reset to admin123" };
    }

    await ctx.db.insert("users", {
      username: "admin",
      passwordHash,
      name: "Administrator",
      role: "ADMIN",
      isActive: true,
      createdAt: Date.now(),
    });
    return { message: "Admin created with password admin123" };
  },
});

import { query } from "./_generated/server";

export const debugUsers = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return all.map(u => ({ username: u.username, isActive: u.isActive, hashPrefix: u.passwordHash.substring(0, 10) }));
  },
});
