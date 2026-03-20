import { Id } from "../../convex/_generated/dataModel";

export interface Product {
  _id: Id<"products">;
  name: string;
  eggsPerTray: number;
  currentStockQtyTrays: number;
  currentStockQtyLoose: number;
  _creationTime: number;
}
