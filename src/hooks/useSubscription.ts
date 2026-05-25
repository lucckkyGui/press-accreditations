import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { getTierByProductId, type SubscriptionTier } from "@/config/stripe";

interface SubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: null,
    subscriptionEnd: null,
    isLoading: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ subscribed: false, tier: null, subscriptionEnd: null, isLoading: false });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setState({
        subscribed: data.subscribed ?? false,
        tier: data.product_id ? getTierByProductId(data.product_id) : null,
        subscriptionEnd: data.subscription_end ?? null,
        isLoading: false,
      });
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return { ...state, refreshSubscription: checkSubscription };
};
