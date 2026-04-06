import React from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import UpgradeBanner from "@/components/common/UpgradeBanner";
import type { PlanLimits } from "@/config/stripe";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  feature: keyof Omit<PlanLimits, 'maxGuests' | 'maxEvents'>;
  featureLabel: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: "block" | "blur" | "disable";
}

/**
 * Wraps a component and shows an upgrade banner if the user's plan
 * doesn't include the required feature.
 * 
 * Modes:
 * - "block" (default): Replaces content with upgrade banner
 * - "blur": Shows blurred content with overlay lock
 * - "disable": Renders children but passes disabled context
 */
const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  featureLabel,
  children,
  fallback,
  mode = "block",
}) => {
  const { canUseFeature, getRequiredTierForFeature, isLoading } = useFeatureAccess();

  if (isLoading) return <>{children}</>;

  if (!canUseFeature(feature)) {
    if (fallback) return <>{fallback}</>;

    if (mode === "blur") {
      return (
        <div className="relative">
          <div className="filter blur-sm pointer-events-none select-none" aria-hidden="true">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
            <div className="text-center space-y-3 p-6 max-w-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <UpgradeBanner
                requiredTier={getRequiredTierForFeature(feature)}
                featureLabel={featureLabel}
              />
            </div>
          </div>
        </div>
      );
    }

    return <UpgradeBanner requiredTier={getRequiredTierForFeature(feature)} featureLabel={featureLabel} />;
  }

  return <>{children}</>;
};

export default FeatureGate;
