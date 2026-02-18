import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useListUsers(token: string) {
  return useSuspenseQuery(convexQuery(api.users.listUsers, { token }));
}

export function useCreateUser() {
  return useMutation(api.users.createUser);
}

export function useToggleUserActive() {
  return useMutation(api.users.toggleUserActive);
}
