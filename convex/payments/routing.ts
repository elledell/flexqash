export type Provider = "mpesa" | "manual" | "selar" | "paystack";

// Map every country code to its designated payment processing flow
export const PROVIDER_BY_COUNTRY: Record<string, Provider> = {
  KE: "mpesa",      // Kenya uses automated STK push
  UG: "manual",     // Uganda manual mobile money
  MW: "manual",     // Malawi manual mobile money
  TZ: "manual",     // Tanzania manual mobile money
  ZM: "manual",     // Zambia manual mobile money
  SS: "manual",     // South Sudan manual mobile money
  BW: "manual",     // Botswana manual mobile money
  GH: "manual", // Ensure this says "manual" instead of "selar"
  CM: "selar",  // Ensure Cameroon is set to "selar"
  INT: "manual",      // Ghana uses Selar link
  NG: "selar",      // Nigeria uses Selar link
  RW: "manual",     // Rwanda (Coming soon - fallback to manual)
};