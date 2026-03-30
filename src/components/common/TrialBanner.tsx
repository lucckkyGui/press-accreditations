import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useState, useEffect } from "react";

const TRIAL_BANNER_DISMISSED_KEY = "trial-banner-dismissed";

const TrialBanner: React.FC = () => {
  const navigate = useNavigate();
  const { subscribed, isLoading } = useSubscription();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(TRIAL_BANNER_DISMISSED_KEY);
    if (!wasDismissed) setDismissed(false);
  }, []);

  if (isLoading || subscribed || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(TRIAL_BANNER_DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="relative bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground rounded-2xl p-4 sm:p-5 mb-6 shadow-lg shadow-primary/20">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-primary-foreground/20 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-foreground/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base">Wypróbuj plan Professional za darmo przez 14 dni</p>
            <p className="text-xs sm:text-sm opacity-90 mt-0.5">
              Pełny dostęp do analityki, mass mailingu i własnego brandingu. Bez karty kredytowej.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate('/#pricing')}
          className="shrink-0 rounded-xl font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Rozpocznij trial
        </Button>
      </div>
    </div>
  );
};

export default TrialBanner;
