import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useContacts(type?: "customer" | "vendor") {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContacts, type ? { type } : {})
  );
}

export function useContactById(id: Id<"contacts">) {
  return useSuspenseQuery(
    convexQuery(api.contacts.getContactById, { id })
  );
}

export function useCreateContact() {
  return useMutation(api.contacts.createContact);
}

export function useUpdateContact() {
  return useMutation(api.contacts.updateContact);
}

export function useUpdateBalance() {
  return useMutation(api.contacts.updateBalance);
}
