/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as contacts from "../contacts.js";
import type * as expenses from "../expenses.js";
import type * as featureFlags from "../featureFlags.js";
import type * as inventory from "../inventory.js";
import type * as products from "../products.js";
import type * as rates from "../rates.js";
import type * as saleTrips from "../saleTrips.js";
import type * as seed from "../seed.js";
import type * as seedAdmin from "../seedAdmin.js";
import type * as transactions from "../transactions.js";
import type * as tripExpenses from "../tripExpenses.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  contacts: typeof contacts;
  expenses: typeof expenses;
  featureFlags: typeof featureFlags;
  inventory: typeof inventory;
  products: typeof products;
  rates: typeof rates;
  saleTrips: typeof saleTrips;
  seed: typeof seed;
  seedAdmin: typeof seedAdmin;
  transactions: typeof transactions;
  tripExpenses: typeof tripExpenses;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
