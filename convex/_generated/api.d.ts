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
import type * as adminInvestments from "../adminInvestments.js";
import type * as adminPayments from "../adminPayments.js";
import type * as adminUsers from "../adminUsers.js";
import type * as affiliate from "../affiliate.js";
import type * as auth from "../auth.js";
import type * as bonus from "../bonus.js";
import type * as countries from "../countries.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as deposit from "../deposit.js";
import type * as emails from "../emails.js";
import type * as financials from "../financials.js";
import type * as gigs from "../gigs.js";
import type * as hotels from "../hotels.js";
import type * as http from "../http.js";
import type * as investments from "../investments.js";
import type * as leaderboard from "../leaderboard.js";
import type * as membership from "../membership.js";
import type * as payClient from "../payClient.js";
import type * as paymentInstructions from "../paymentInstructions.js";
import type * as payments_mpesa from "../payments/mpesa.js";
import type * as payments_routing from "../payments/routing.js";
import type * as rates from "../rates.js";
import type * as serviceWithdrawals from "../serviceWithdrawals.js";
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
  adminInvestments: typeof adminInvestments;
  adminPayments: typeof adminPayments;
  adminUsers: typeof adminUsers;
  affiliate: typeof affiliate;
  auth: typeof auth;
  bonus: typeof bonus;
  countries: typeof countries;
  crons: typeof crons;
  dashboard: typeof dashboard;
  deposit: typeof deposit;
  emails: typeof emails;
  financials: typeof financials;
  gigs: typeof gigs;
  hotels: typeof hotels;
  http: typeof http;
  investments: typeof investments;
  leaderboard: typeof leaderboard;
  membership: typeof membership;
  payClient: typeof payClient;
  paymentInstructions: typeof paymentInstructions;
  "payments/mpesa": typeof payments_mpesa;
  "payments/routing": typeof payments_routing;
  rates: typeof rates;
  serviceWithdrawals: typeof serviceWithdrawals;
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
