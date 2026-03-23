type UserRole = "ADMIN" | "EMPLOYEE";

type FeatureName =
  | "userManagement"
  | "settings"
  | "adminTrips"
  | "deleteAnyExpense"
  | "deleteAnyTransaction"
  | "viewAllExpenses"
  | "updateRates"
  | "createSales"
  | "viewLedger"
  | "createOwnExpense"
  | "viewOwnExpenses"
  | "deleteOwnExpense";

const FEATURE_FLAGS: Record<FeatureName, UserRole[]> = {
  // Admin only
  userManagement: ["ADMIN"],
  settings: ["ADMIN"],
  adminTrips: ["ADMIN"],
  deleteAnyExpense: ["ADMIN"],
  deleteAnyTransaction: ["ADMIN"],
  viewAllExpenses: ["ADMIN"],
  updateRates: ["ADMIN"],
  
  // Admin + Employee
  createSales: ["ADMIN", "EMPLOYEE"],
  viewLedger: ["ADMIN", "EMPLOYEE"],
  createOwnExpense: ["ADMIN", "EMPLOYEE"],
  viewOwnExpenses: ["ADMIN", "EMPLOYEE"],
  deleteOwnExpense: ["ADMIN", "EMPLOYEE"],
};

export function hasFeature(feature: FeatureName, userRole: UserRole): boolean {
  return FEATURE_FLAGS[feature].includes(userRole);
}
