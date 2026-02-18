import { Id } from "../../convex/_generated/dataModel";

export type ContactType = "customer" | "vendor";

export interface Contact {
  _id: Id<"contacts">;
  name: string;
  type: ContactType;
  phone?: string;
  priceAdjustment: number;
  currentBalance: number;
  _creationTime: number;
}
