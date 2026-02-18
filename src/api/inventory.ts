import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentStock() {
  return useSuspenseQuery(convexQuery(api.inventory.getCurrentStock, {}));
}

export function usePerformStockCheck() {
  return useMutation(api.inventory.performStockCheck);
}
