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
