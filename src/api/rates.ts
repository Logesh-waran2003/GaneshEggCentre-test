import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useTodayRates() {
  return useSuspenseQuery(convexQuery(api.rates.getTodayRates, {}));
}

export function useSetDailyRate() {
  return useMutation(api.rates.setDailyRate);
}
