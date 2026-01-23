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
  requireAuth();
  // Additional admin check can be done in component level
}

export function requireFeature(feature: FeatureName) {
  return () => {
    requireAuth();
    // Feature check will be done at component level with useFeature hook
  };
}
