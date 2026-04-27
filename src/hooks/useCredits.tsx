import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const DAILY_LIMIT = 30;

export interface CreditState {
  daily_credits_used: number;
  is_pro: boolean;
}

/**
 * Single source of truth for daily credits.
 * - Always fetches fresh from user_credits on mount / user change.
 * - Auto-resets locally if 24h have passed since daily_reset_timestamp.
 * - Subscribes to realtime updates so navbar + page stay in sync.
 */
export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CreditState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("user_credits" as any)
      .select("daily_credits_used, is_pro, daily_reset_timestamp")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const row = data as any;
      // Local 24h reset fallback so UI stays correct even if edge fn hasn't run.
      const resetTs = row.daily_reset_timestamp ? new Date(row.daily_reset_timestamp).getTime() : 0;
      const hours = (Date.now() - resetTs) / (1000 * 60 * 60);
      const used = !resetTs || hours >= 24 ? 0 : (row.daily_credits_used ?? 0);
      setCredits({ daily_credits_used: used, is_pro: !!row.is_pro });
    } else {
      setCredits({ daily_credits_used: 0, is_pro: false });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchCredits();
  }, [fetchCredits]);

  // Realtime updates so both navbar + page mirror the same value
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`credits-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          setCredits({
            daily_credits_used: row.daily_credits_used ?? 0,
            is_pro: !!row.is_pro,
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const setUsed = useCallback((nextUsed: number) => {
    setCredits(prev => prev ? { ...prev, daily_credits_used: Math.max(0, nextUsed) } : prev);
  }, []);

  return {
    credits,
    loading,
    isPro: credits?.is_pro ?? false,
    used: credits?.daily_credits_used ?? 0,
    remaining: credits?.is_pro ? Infinity : Math.max(0, DAILY_LIMIT - (credits?.daily_credits_used ?? 0)),
    refresh: fetchCredits,
    setUsed,
  };
}

export const PRO_CHAR_LIMIT = 5000;
export const FREE_CHAR_LIMIT = 300;

export function calcCreditCost(charCount: number): number {
  if (charCount <= 0) return 0;
  return Math.ceil(charCount / 100);
}
