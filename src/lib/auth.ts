import { redirect } from "@tanstack/react-router";

export function requireAuth() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
  }
}

export function requireAdmin() {
  requireAuth();
  // Additional admin check can be done in component level
}
