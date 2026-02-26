import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_LIMITS, type PlanLimits, type SubscriptionTier } from "@/config/stripe";

export const useFeatureAccess = () => {
  const { subscribed, tier, isLoading } = useSubscription();

  const currentTier: SubscriptionTier | 'free' = subscribed && tier ? tier : 'free';
  const limits: PlanLimits = PLAN_LIMITS[currentTier];

  const canUseFeature = (feature: keyof Omit<PlanLimits, 'maxGuests' | 'maxEvents'>): boolean => {
    return limits[feature] as boolean;
  };

  const isWithinGuestLimit = (currentCount: number): boolean => {
    return currentCount < limits.maxGuests;
  };

  const isWithinEventLimit = (currentCount: number): boolean => {
    return currentCount < limits.maxEvents;
  };

  const getRequiredTierForFeature = (feature: keyof Omit<PlanLimits, 'maxGuests' | 'maxEvents'>): SubscriptionTier => {
    const tiers: SubscriptionTier[] = ['starter', 'professional', 'enterprise'];
    for (const t of tiers) {
      if (PLAN_LIMITS[t][feature] === true) return t;
    }
    return 'enterprise';
  };

  return {
    currentTier,
    limits,
    canUseFeature,
    isWithinGuestLimit,
    isWithinEventLimit,
    getRequiredTierForFeature,
    isLoading,
  };
};
