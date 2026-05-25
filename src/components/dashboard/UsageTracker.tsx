import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { STRIPE_TIERS } from "@/config/stripe";
import { BarChart3, Users, Calendar, Crown } from "lucide-react";

interface UsageItemProps {
  label: string;
  current: number;
  max: number;
  icon: React.ReactNode;
}

const UsageItem: React.FC<UsageItemProps> = ({ label, current, max, icon }) => {
  const percentage = max === Infinity ? 0 : Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className={isNearLimit ? "text-amber-600 font-semibold" : "text-muted-foreground"}>
          {current} / {max === Infinity ? "∞" : max}
        </span>
      </div>
      {max !== Infinity && (
        <Progress
          value={percentage}
          className={`h-2 ${isNearLimit ? "[&>div]:bg-amber-500" : ""}`}
        />
      )}
    </div>
  );
};

interface UsageTrackerProps {
  guestCount: number;
  eventCount: number;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ guestCount, eventCount }) => {
  const { currentTier, limits } = useFeatureAccess();
  const tierName = currentTier === "free" ? "Free" : STRIPE_TIERS[currentTier as keyof typeof STRIPE_TIERS]?.name || currentTier;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Wykorzystanie zasobów
          </div>
          <span className="text-xs font-normal px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Plan {tierName}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageItem
          label="Goście"
          current={guestCount}
          max={limits.maxGuests}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <UsageItem
          label="Wydarzenia"
          current={eventCount}
          max={limits.maxEvents}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
      </CardContent>
    </Card>
  );
};

export default UsageTracker;
