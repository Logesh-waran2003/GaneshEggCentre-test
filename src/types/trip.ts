import { Id } from "../../convex/_generated/dataModel";
import { Product } from "./product";
import { User } from "./user";

export type TripStatus = "PENDING_APPROVAL" | "IN_PROGRESS" | "COMPLETED" | "APPROVED";

export interface Trip {
  _id: Id<"saleTrips">;
  date: number;
  employees: Id<"users">[];
  createdBy: Id<"users">;
  status: TripStatus;
  productId: Id<"products">;
  loadedQtyTrays: number;
  loadedQtyLoose: number;
  soldQtyTrays: number;
  soldQtyLoose: number;
  returnedQtyTrays: number;
  returnedQtyLoose: number;
  damagedQtyTrays: number;
  damagedQtyLoose: number;
  totalCashCollected: number;
  startedAt?: number;
  completedAt?: number;
  approvedAt?: number;
  approvedBy?: Id<"users">;
  _creationTime: number;
}

export interface TripWithDetails extends Trip {
  product: Product | null;
  employeeDetails: (User | null)[];
}
