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

export function useDashboardStats(token: string | null) {
  return useSuspenseQuery(convexQuery(api.transactions.getDashboardStats, { token: token ?? "" }));
}

export function useSales(token: string | null, date?: number) {
  return useSuspenseQuery(
    convexQuery(api.transactions.getSales, { token: token ?? "", date })
  );
}

export function useUpdateSale() {
  return useMutation(api.transactions.updateSale);
}

export function useDeleteSale() {
  return useMutation(api.transactions.deleteSale);
}

export function usePurchases(token: string | null, date?: number) {
  return useSuspenseQuery(
    convexQuery(api.transactions.getPurchases, { token: token ?? "", date })
  );
}
