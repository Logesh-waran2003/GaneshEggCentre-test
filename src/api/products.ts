import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useProducts() {
  return useSuspenseQuery(convexQuery(api.products.getProducts, {}));
}

export function useCreateProduct() {
  return useMutation(api.products.createProduct);
}

export function useUpdateProduct() {
  return useMutation(api.products.updateProduct);
}

export function useDeleteProduct() {
  return useMutation(api.products.deleteProduct);
}
