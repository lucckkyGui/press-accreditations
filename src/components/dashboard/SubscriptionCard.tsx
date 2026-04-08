import React from "react";
import { useNavigate } from "react-router-dom";
import { Crown, CreditCard, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STRIPE_TIERS } from "@/config/stripe";

interface SubscriptionCardProps {
  subscribed: boolean;
  tier: string | null;
  subscriptionEnd: string | null;
  subLoading: boolean;
  portalLoading: boolean;
  openCustomerPortal: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscribed, tier, subscriptionEnd, subLoading, portalLoading, openCustomerPortal
}) => {
  const navigate = useNavigate();

  return (
    <Card className={`rounded-2xl overflow-hidden border-0 shadow-md ${subscribed ? 'bg-primary/5' : 'bg-warning/5'}`}>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5 px-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${subscribed ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-foreground">
                {subLoading ? 'Sprawdzanie...' : subscribed ? `Plan ${tier ? STRIPE_TIERS[tier]?.name : 'Aktywny'}` : 'Brak aktywnego planu'}
              </span>
              {subscribed && (
                <Badge className="text-xs bg-primary/15 text-primary border-0 hover:bg-primary/20">Aktywny</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {subscribed && subscriptionEnd
                ? `Odnowienie: ${new Date(subscriptionEnd).toLocaleDateString('pl-PL')}`
                : 'Wybierz plan, aby odblokować pełne możliwości'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {subscribed ? (
            <Button variant="outline" size="sm" onClick={openCustomerPortal} disabled={portalLoading} className="rounded-xl">
              <CreditCard className="h-4 w-4 mr-2" />
              {portalLoading ? 'Otwieranie...' : 'Zarządzaj subskrypcją'}
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate('/home#pricing')} className="rounded-xl gap-2">
              <Sparkles className="h-4 w-4" />
              Wybierz plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
