import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useExpenses(token: string, employeeId?: Id<"users">) {
  return useSuspenseQuery(
    convexQuery(api.expenses.listExpenses, { token, employeeId })
  );
}

export function useCreateExpense() {
  return useMutation(api.expenses.createExpense);
}

export function useDeleteExpense() {
  return useMutation(api.expenses.deleteExpense);
}

export function useEmployeeExpenses(employeeId: Id<"users">, startDate: number, endDate: number) {
  return useSuspenseQuery(
    convexQuery(api.expenses.getEmployeeExpenses, { employeeId, startDate, endDate })
  );
}
