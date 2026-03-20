import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useTodayTrips(token: string | null) {
  return useQuery({
    ...convexQuery(api.saleTrips.getTodayTrips, { token: token ?? "" }),
    enabled: !!token,
  });
}

export function useTripDetails(token: string, tripId: Id<"saleTrips">) {
  return useSuspenseQuery(
    convexQuery(api.saleTrips.getTripDetails, { token, tripId })
  );
}

export function useActiveTrips(token: string | null) {
  return useQuery({
    ...convexQuery(api.saleTrips.getActiveTrips, { token: token ?? "" }),
    enabled: !!token,
  });
}

export function useCreateTrip() {
  return useMutation(api.saleTrips.createTrip);
}

export function useApproveStartTrip() {
  return useMutation(api.saleTrips.approveStartTrip);
}

export function useCompleteTrip() {
  return useMutation(api.saleTrips.completeTrip);
}

export function useApproveEndTrip() {
  return useMutation(api.saleTrips.approveEndTrip);
}

export function useTripExpenses(tripId: Id<"saleTrips">) {
  return useSuspenseQuery(
    convexQuery(api.tripExpenses.getTripExpenses, { tripId })
  );
}

export function useTripProfitability(tripId: Id<"saleTrips">) {
  return useSuspenseQuery(
    convexQuery(api.tripExpenses.getTripProfitability, { tripId })
  );
}

export function useAddTripExpense() {
  return useMutation(api.tripExpenses.addTripExpense);
}

export function useDeleteTripExpense() {
  return useMutation(api.tripExpenses.deleteTripExpense);
}
