import { Id } from "../../convex/_generated/dataModel";

export interface Expense {
  _id: Id<"expenses">;
  description: string;
  amount: number;
  category: string;
  date: number;
  _creationTime: number;
}
