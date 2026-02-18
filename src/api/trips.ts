import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useTodayTrips(token: string) {
  return useSuspenseQuery(convexQuery(api.saleTrips.getTodayTrips, { token }));
}

export function useTripDetails(token: string, tripId: Id<"saleTrips">) {
  return useSuspenseQuery(
    convexQuery(api.saleTrips.getTripDetails, { token, tripId })
  );
}

export function useActiveTrips(token: string) {
  return useSuspenseQuery(convexQuery(api.saleTrips.getActiveTrips, { token }));
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
