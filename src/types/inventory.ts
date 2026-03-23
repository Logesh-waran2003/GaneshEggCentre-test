import { Id } from "../../convex/_generated/dataModel";

export interface InventoryItem {
  _id: Id<"products">;
  productName: string;
  quantity: number;
  lastUpdated: number;
  _creationTime: number;
}

export interface StockCheck {
  _id: Id<"stockChecks">;
  productId: Id<"products">;
  type: "MORNING" | "EVENING";
  systemQtyTrays: number;
  systemQtyLoose: number;
  physicalQtyTrays: number;
  physicalQtyLoose: number;
  varianceTrays: number;
  varianceLoose: number;
  date: number;
  remarks?: string;
  _creationTime: number;
}
