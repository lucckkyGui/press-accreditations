import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar, Crown, ExternalLink, Loader2, Sparkles, Shield, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_TIERS, PLAN_LIMITS } from "@/config/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCheckout } from "@/hooks/useCheckout";

const tierLabels: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  starter: { name: "Starter", icon: <Zap className="h-5 w-5" />, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  professional: { name: "Professional", icon: <Crown className="h-5 w-5" />, color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  enterprise: { name: "Enterprise", icon: <Shield className="h-5 w-5" />, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
};

const SubscriptionManagement = () => {
  const { subscribed, tier, subscriptionEnd, isLoading, refreshSubscription } = useSubscription();
  const { startCheckout, isLoading: checkoutLoading } = useCheckout();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      toast.error("Nie udało się otworzyć portalu zarządzania subskrypcją");
    } finally {
      setPortalLoading(false);
    }
  };

  const currentTier = tier ? tierLabels[tier] : null;
  const currentLimits = tier ? PLAN_LIMITS[tier] : PLAN_LIMITS.free;
  const currentPrice = tier ? STRIPE_TIERS[tier].price : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="overflow-hidden">
        <div className={`h-1.5 ${subscribed ? 'bg-gradient-to-r from-primary to-primary/60' : 'bg-muted'}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Twoja subskrypcja</CardTitle>
              <CardDescription>Zarządzaj planem i płatnościami</CardDescription>
            </div>
            {subscribed && currentTier && (
              <Badge variant="outline" className={`px-3 py-1.5 text-sm font-semibold gap-1.5 ${currentTier.color}`}>
                {currentTier.icon}
                {currentTier.name}
              </Badge>
            )}
            {!subscribed && (
              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                Darmowy
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscribed ? (
            <>
              {/* Subscription details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Miesięczna opłata</p>
                    <p className="text-lg font-bold">{currentPrice} PLN</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Następne odnowienie</p>
                    <p className="text-lg font-bold">
                      {subscriptionEnd
                        ? new Date(subscriptionEnd).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-bold text-green-600">Aktywna</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Plan limits */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Limity Twojego planu</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <LimitItem label="Goście" value={currentLimits.maxGuests === Infinity ? "∞" : currentLimits.maxGuests.toString()} />
                  <LimitItem label="Wydarzenia" value={currentLimits.maxEvents === Infinity ? "∞" : currentLimits.maxEvents.toString()} />
                  <LimitItem label="Bulk Email" value={currentLimits.bulkEmail ? "✓" : "✗"} active={currentLimits.bulkEmail} />
                  <LimitItem label="Analityka" value={currentLimits.analytics ? "✓" : "✗"} active={currentLimits.analytics} />
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleManageSubscription} disabled={portalLoading} className="gap-2">
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Zarządzaj subskrypcją
                </Button>
                <Button variant="outline" onClick={() => refreshSubscription()} className="gap-2">
                  Odśwież status
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Aktywuj plan premium</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Odblokuj pełny potencjał platformy — więcej gości, wydarzeń, zaproszenia masowe i zaawansowana analityka.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.entries(STRIPE_TIERS) as [string, typeof STRIPE_TIERS.starter][]).map(([key, t]) => {
                  const info = tierLabels[key];
                  return (
                    <Card key={key} className="relative">
                      {key === "professional" && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground text-xs">Popularny</Badge>
                        </div>
                      )}
                      <CardContent className="pt-6 text-center space-y-3">
                        <div className={`mx-auto h-10 w-10 rounded-xl flex items-center justify-center ${info.color}`}>
                          {info.icon}
                        </div>
                        <h4 className="font-bold">{info.name}</h4>
                        <p className="text-2xl font-extrabold">{t.price} <span className="text-sm font-normal text-muted-foreground">PLN/mies.</span></p>
                        <Button
                          size="sm"
                          variant={key === "professional" ? "default" : "outline"}
                          className="w-full"
                          onClick={() => startCheckout(t.price_id)}
                          disabled={checkoutLoading}
                        >
                          {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wybierz plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const LimitItem = ({ label, value, active }: { label: string; value: string; active?: boolean }) => (
  <div className="text-center p-3 rounded-lg bg-muted/30 border">
    <p className={`text-lg font-bold ${active === false ? 'text-muted-foreground' : ''}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default SubscriptionManagement;
