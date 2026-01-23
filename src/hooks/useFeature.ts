import { useAuth } from "../contexts/AuthContext";
import { hasFeature, FeatureName } from "../lib/featureFlags";

export function useFeature(feature: FeatureName): boolean {
  const { currentUser } = useAuth();
  
  if (!currentUser) return false;
  
  return hasFeature(feature, currentUser.role);
}
