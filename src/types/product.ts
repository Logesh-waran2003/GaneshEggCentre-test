import { Id } from "../../convex/_generated/dataModel";

export interface Product {
  _id: Id<"products">;
  name: string;
  baseRate: number;
  unit: string;
  _creationTime: number;
}
