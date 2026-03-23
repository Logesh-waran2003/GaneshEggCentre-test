import { Id } from "../../convex/_generated/dataModel";

export interface SaleItem {
  productId: Id<"products">;
  qtyTrays: number;
  qtyLoose: number;
  rateApplied: number;
  breakageQty: number;
}

export interface Sale {
  _id: Id<"transactions">;
  contactId: Id<"contacts">;
  type: "SALE";
  amount: number;
  date: number;
  description?: string;
  cashCollected?: number;
  salesTripId?: Id<"saleTrips">;
  items?: SaleItem[];
  _creationTime: number;
}
