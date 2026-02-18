import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useContactTransactions(contactId: Id<"contacts">) {
  return useSuspenseQuery(
    convexQuery(api.transactions.getContactTransactions, { contactId })
  );
}

export function useCreateTransaction() {
  return useMutation(api.transactions.createTransaction);
}

export function useDashboardStats() {
  return useSuspenseQuery(convexQuery(api.transactions.getDashboardStats, {}));
}
