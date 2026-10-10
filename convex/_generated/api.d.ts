/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTPPasswordReset from "../ResendOTPPasswordReset.js";
import type * as access from "../access.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as adminDeposits from "../adminDeposits.js";
import type * as adminPayments from "../adminPayments.js";
import type * as adminUsers from "../adminUsers.js";
import type * as affiliate from "../affiliate.js";
import type * as auth from "../auth.js";
import type * as countries from "../countries.js";
import type * as dashboard from "../dashboard.js";
import type * as deposit from "../deposit.js";
import type * as financials from "../financials.js";
import type * as http from "../http.js";
import type * as membership from "../membership.js";
import type * as paymentInstructions from "../paymentInstructions.js";
import type * as payments_mpesa from "../payments/mpesa.js";
import type * as payments_routing from "../payments/routing.js";
import type * as rates from "../rates.js";
import type * as team from "../team.js";
import type * as users from "../users.js";
import type * as withdrawals from "../withdrawals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTPPasswordReset: typeof ResendOTPPasswordReset;
  access: typeof access;
  adminDashboard: typeof adminDashboard;
  adminDeposits: typeof adminDeposits;
  adminPayments: typeof adminPayments;
  adminUsers: typeof adminUsers;
  affiliate: typeof affiliate;
  auth: typeof auth;
  countries: typeof countries;
  dashboard: typeof dashboard;
  deposit: typeof deposit;
  financials: typeof financials;
  http: typeof http;
  membership: typeof membership;
  paymentInstructions: typeof paymentInstructions;
  "payments/mpesa": typeof payments_mpesa;
  "payments/routing": typeof payments_routing;
  rates: typeof rates;
  team: typeof team;
  users: typeof users;
  withdrawals: typeof withdrawals;
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
