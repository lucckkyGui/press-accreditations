import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { STRIPE_TIERS, type SubscriptionTier } from "@/config/stripe";

interface UpgradeBannerProps {
  requiredTier: SubscriptionTier;
  featureLabel: string;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ requiredTier, featureLabel }) => {
  const navigate = useNavigate();
  const tierName = STRIPE_TIERS[requiredTier].name;

  return (
    <Alert className="border-amber-200 bg-amber-50/50">
      <Crown className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Wymagany plan {tierName}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-amber-700">
          Funkcja „{featureLabel}" jest dostępna od planu {tierName}.
        </span>
        <Button size="sm" onClick={() => navigate('/home#pricing')} className="shrink-0">
          <Crown className="h-4 w-4 mr-1" />
          Ulepsz plan
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default UpgradeBanner;
