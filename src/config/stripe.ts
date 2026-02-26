// Stripe product/price mapping for subscription tiers
export const STRIPE_TIERS = {
  starter: {
    product_id: "prod_U3EtBeTU8Mow1f",
    price_id: "price_1T58QBL2xYSV1Z3ieSDjku4F",
    name: "Starter",
    price: 119,
  },
  professional: {
    product_id: "prod_U3EuuuCLL5mTXp",
    price_id: "price_1T58QgL2xYSV1Z3iu2TrD5oT",
    name: "Professional",
    price: 319,
  },
  enterprise: {
    product_id: "prod_U3Eu8FqLSRknZD",
    price_id: "price_1T58R4L2xYSV1Z3i0zx7edFf",
    name: "Enterprise",
    price: 799,
  },
} as const;

export type SubscriptionTier = keyof typeof STRIPE_TIERS;

export const getTierByProductId = (productId: string): SubscriptionTier | null => {
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.product_id === productId) return tier as SubscriptionTier;
  }
  return null;
};
