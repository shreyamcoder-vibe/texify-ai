import { useCallback, useEffect, useState } from "react";

export const DAILY_LIMIT = 30;
export const PRO_CHAR_LIMIT = 5000;
export const FREE_CHAR_LIMIT = 300;

const STORAGE_KEY = "guest_credits_v1";

interface StoredCredits {
  date: string; // YYYY-MM-DD (local)
  used: number;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadCredits(): StoredCredits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredCredits;
      if (parsed.date === todayKey()) return parsed;
    }
  } catch { /* ignore */ }
  return { date: todayKey(), used: 0 };
}

function saveCredits(c: StoredCredits) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

export function calcCreditCost(charCount: number): number {
  if (charCount <= 0) return 0;
  return Math.ceil(charCount / 100);
}

/**
 * Guest-mode credits stored in localStorage. Resets per local calendar day.
 */
export function useCredits() {
  const [used, setUsedState] = useState<number>(() => loadCredits().used);

  // Re-sync if day rolled over while tab was open
  useEffect(() => {
    const id = setInterval(() => {
      const c = loadCredits();
      setUsedState(c.used);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const setUsed = useCallback((next: number) => {
    const safe = Math.max(0, next);
    setUsedState(safe);
    saveCredits({ date: todayKey(), used: safe });
  }, []);

  const refresh = useCallback(async () => {
    setUsedState(loadCredits().used);
  }, []);

  const isPro = false;

  return {
    credits: { daily_credits_used: used, is_pro: isPro },
    loading: false,
    isPro,
    used,
    remaining: Math.max(0, DAILY_LIMIT - used),
    refresh,
    setUsed,
  };
}
