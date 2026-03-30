import React from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import UpgradeBanner from "@/components/common/UpgradeBanner";
import type { PlanLimits } from "@/config/stripe";

interface FeatureGateProps {
  feature: keyof Omit<PlanLimits, 'maxGuests' | 'maxEvents'>;
  featureLabel: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps a component and shows an upgrade banner if the user's plan
 * doesn't include the required feature.
 */
const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  featureLabel,
  children,
  fallback,
}) => {
  const { canUseFeature, getRequiredTierForFeature, isLoading } = useFeatureAccess();

  if (isLoading) return <>{children}</>;

  if (!canUseFeature(feature)) {
    if (fallback) return <>{fallback}</>;
    return <UpgradeBanner requiredTier={getRequiredTierForFeature(feature)} featureLabel={featureLabel} />;
  }

  return <>{children}</>;
};

export default FeatureGate;
