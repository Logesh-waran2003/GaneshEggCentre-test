import { Id } from "../../convex/_generated/dataModel";

export interface Rate {
  _id: Id<"dailyBoardRates">;
  productId: Id<"products">;
  neccRatePerEgg?: number;
  ratePerEgg: number;
  ratePerTray: number;
  wholesaleRatePerTray?: number;
  date: number;
  _creationTime: number;
}
