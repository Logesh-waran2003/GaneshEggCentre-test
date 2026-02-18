import { Id } from "../../convex/_generated/dataModel";

export interface Rate {
  _id: Id<"dailyBoardRates">;
  productId: Id<"products">;
  ratePerEgg: number;
  ratePerTray: number;
  date: number;
  _creationTime: number;
}
