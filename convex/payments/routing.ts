export type Provider = "mpesa" | "paystack";

// Add a line per country as each provider is built
export const PROVIDER_BY_COUNTRY: Record<string, Provider> = {
  KE: "mpesa",
};