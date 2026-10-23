export const COUNTRY_FINANCIALS: Record<
  string,
  {
    currency: string;
    l1: number;
    l2: number;
    l3: number;
    minWithdrawal: number;
    withdrawalFee: number;
  }
> = {
  KE: { currency: "KES", l1: 200, l2: 100, l3: 50, minWithdrawal: 400, withdrawalFee: 35 },
  TZ: { currency: "TZS", l1: 4520, l2: 2036, l3: 1018, minWithdrawal: 13000, withdrawalFee: 2000 },
  UG: { currency: "UGX", l1: 7638, l2: 3055, l3: 1375, minWithdrawal: 18000, withdrawalFee: 2500 },
  RW: { currency: "RWF", l1: 2975, l2: 1664, l3: 604, minWithdrawal: 5500, withdrawalFee: 500 },
  BI: { currency: "BIF", l1: 8584, l2: 4640, l3: 2784, minWithdrawal: 28000, withdrawalFee: 4500 },
  ZM: { currency: "ZMW", l1: 55, l2: 33, l3: 22, minWithdrawal: 130, withdrawalFee: 30 },
  MW: { currency: "MWK", l1: 7000, l2: 1000, l3: 500, minWithdrawal: 14000, withdrawalFee: 2000 },
  BW: { currency: "BWP", l1: 35, l2: 18, l3: 9, minWithdrawal: 90, withdrawalFee: 15 },
  CM: { currency: "XAF", l1: 1718, l2: 737, l3: 366, minWithdrawal: 3100, withdrawalFee: 700 },
  GH: { currency: "GHS", l1: 36, l2: 13, l3: 9, minWithdrawal: 85, withdrawalFee: 10 },
  SS: { currency: "SSP", l1: 13162, l2: 6449, l3: 2501, minWithdrawal: 20000, withdrawalFee: 5700 },
  NG: { currency: "NGN", l1: 3726, l2: 1858, l3: 647, minWithdrawal: 8500, withdrawalFee: 1500 },
  CD: { currency: "CDF", l1: 0, l2: 0, l3: 0, minWithdrawal: 15000, withdrawalFee: 2500 },
  INT: { currency: "USD", l1: 3.14, l2: 1.25, l3: 0.62, minWithdrawal: 10, withdrawalFee: 1 }, // Converted from KSH to approx USD
};

export interface TierFee {
  min: number;
  max?: number;
  fee: number;
}

export const WITHDRAWAL_RULES: Record<
  string,
  {
    currency: string;
    minWithdrawal: number;
    tiers: TierFee[];
  }
> = {
  KE: {
    currency: "KES",
    minWithdrawal: 400,
    tiers: [
      { min: 400, max: 4000, fee: 35 },
      { min: 4000, max: 9999, fee: 70 },
      { min: 10000, max: 100000, fee: 130 },
    ],
  },
  MW: {
    currency: "MWK",
    minWithdrawal: 14000,
    tiers: [
      { min: 14000, max: 30000, fee: 2000 },
      { min: 30000, max: 400000, fee: 3000 },
    ],
  },
  ZM: {
    currency: "ZMW",
    minWithdrawal: 130,
    tiers: [
      { min: 130, max: 400, fee: 30 },
      { min: 400, fee: 50 },
    ],
  },
  UG: {
    currency: "UGX",
    minWithdrawal: 18000,
    tiers: [
      { min: 18000, max: 40000, fee: 2500 },
      { min: 40000, max: 1000000, fee: 5000 },
    ],
  },
  NG: {
    currency: "NGN",
    minWithdrawal: 8500,
    tiers: [
      { min: 8500, max: 20000, fee: 1500 },
      { min: 20000, max: 100000, fee: 2000 },
    ],
  },
  TZ: {
    currency: "TZS",
    minWithdrawal: 13000,
    tiers: [
      { min: 13000, max: 30000, fee: 2000 },
      { min: 30000, max: 800000, fee: 3000 },
    ],
  },
  BW: {
    currency: "BWP",
    minWithdrawal: 90,
    tiers: [
      { min: 90, max: 400, fee: 15 },
      { min: 400, max: 2000, fee: 21 },
    ],
  },
  CM: {
    currency: "XAF",
    minWithdrawal: 3100,
    tiers: [
      { min: 3100, max: 10000, fee: 700 },
      { min: 10000, max: 400000, fee: 1000 },
    ],
  },
  GH: {
    currency: "GHS",
    minWithdrawal: 85,
    tiers: [
      { min: 85, max: 2000, fee: 10 },
      { min: 2000, max: 3000, fee: 50 },
    ],
  },
  BI: {
    currency: "BIF",
    minWithdrawal: 28000,
    tiers: [
      { min: 28000, max: 70000, fee: 4500 },
      { min: 70000, max: 400000, fee: 5000 },
    ],
  },
  RW: {
    currency: "RWF",
    minWithdrawal: 5500,
    tiers: [
      { min: 5500, max: 20000, fee: 500 },
      { min: 20000, max: 100000, fee: 1000 },
    ],
  },
  CD: {
    currency: "CDF",
    minWithdrawal: 15000,
    tiers: [
      { min: 15000, max: 50000, fee: 2500 },
      { min: 50000, max: 300000, fee: 3500 },
    ],
  },
  SS: {
    currency: "SSP",
    minWithdrawal: 20000,
    tiers: [
      { min: 20000, max: 100000, fee: 5700 },
      { min: 100000, max: 400000, fee: 6500 },
    ],
  },
  INT: {
    currency: "USD",
    minWithdrawal: 10,
    tiers: [
      { min: 10, max: 50, fee: 1 },
      { min: 50, max: 100, fee: 2 },
    ],
  },
};

export function calculateWithdrawalFee(countryCode: string, amount: number) {
  const rule = WITHDRAWAL_RULES[countryCode] ?? WITHDRAWAL_RULES.KE;
  let fee = 0;
  for (const t of rule.tiers) {
    if (amount >= t.min && (t.max === undefined || amount <= t.max)) {
      fee = t.fee;
      break;
    }
  }
  // Default to highest tier fee if amount exceeds the top tier
  if (!fee && rule.tiers.length > 0) {
    fee = rule.tiers[rule.tiers.length - 1].fee;
  }
  return {
    fee,
    minWithdrawal: rule.minWithdrawal,
    netAmount: Math.max(0, amount - fee),
    currency: rule.currency,
  };
}