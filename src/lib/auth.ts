import { redirect } from "@tanstack/react-router";
import { FeatureName } from "./featureFlags";

export function requireAuth() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
  }
}

export function requireAdmin() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
    const role = localStorage.getItem("user_role");
    if (role !== "ADMIN") {
      throw redirect({ to: "/" });
    }
  }
}

export function requireFeature(_feature: FeatureName) {
  return () => {
    requireAuth();
    // Feature check will be done at component level with useFeature hook
  };
}
