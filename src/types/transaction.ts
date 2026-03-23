import { Id } from "../../convex/_generated/dataModel";

export type TransactionType = "SALE" | "PURCHASE" | "PAYMENT_IN" | "PAYMENT_OUT";

export interface Transaction {
  _id: Id<"transactions">;
  contactId: Id<"contacts">;
  type: TransactionType;
  amount: number;
  date: number;
  description?: string;
  cashCollected?: number;
  relatedTransactionId?: Id<"transactions">;
  createdBy?: Id<"users">;
  salesTripId?: Id<"saleTrips">;
  _creationTime: number;
}
