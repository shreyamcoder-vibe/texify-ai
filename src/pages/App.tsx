import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TONES, DAILY_CREDIT_LIMIT, MONTHLY_BONUS_LIMIT, FREE_TONES } from "@/lib/constants";
import {
  Sparkles, Copy, Check, Loader2, Crown, ArrowDown, RefreshCw, Lock, Clock
} from "lucide-react";

interface FixResult {
  fixedMessage: string;
  creditCost: number;
  dailyCreditsUsed: number;
  dailyCreditsRemaining: number | string;
  monthlyBonusUsed: number;
  monthlyBonusRemaining: number | string;
  isPro: boolean;
}

interface UserCredits {
  daily_credits_used: number;
  monthly_bonus_used: number;
  is_pro: boolean;
}

export default function AppPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [result, setResult] = useState<FixResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [limitType, setLimitType] = useState<"daily" | "monthly">("daily");
  const [cooldown, setCooldown] = useState(0);
  const [credits, setCredits] = useState<UserCredits | null>(null);

  const isPro = credits?.is_pro ?? false;
  const dailyRemaining = isPro ? "∞" : Math.max(0, DAILY_CREDIT_LIMIT - (credits?.daily_credits_used ?? 0));
  const monthlyBonusRemaining = isPro ? "∞" : Math.max(0, MONTHLY_BONUS_LIMIT - (credits?.monthly_bonus_used ?? 0));

  const isProTone = (tone: string) => !FREE_TONES.includes(tone);

  // Fetch credits
  const fetchCredits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits" as any)
      .select("daily_credits_used, monthly_bonus_used, is_pro")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setCredits(data as unknown as UserCredits);
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleToneSelect = (tone: string) => {
    if (!isPro && isProTone(tone)) {
      // Check if bonus is exhausted
      if ((credits?.monthly_bonus_used ?? 0) >= MONTHLY_BONUS_LIMIT) {
        setShowUpgrade(true);
        return;
      }
    }
    setSelectedTone(tone);
  };

  const handleFix = async () => {
    if (!inputText.trim()) {
      toast({ variant: "destructive", title: "Empty message", description: "Please enter a message to fix." });
      return;
    }
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("fix-message", {
        body: { message: inputText.slice(0, 300), tone: selectedTone },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.requiresUpgrade) {
          if (data.type === "monthly_bonus") {
            setLimitType("monthly");
          } else {
            setLimitType("daily");
          }
          setShowLimitReached(true);
        } else {
          toast({ variant: "destructive", title: "Error", description: data.error });
        }
        return;
      }

      setResult(data);
      setCooldown(3);
      // Update local credits
      if (data.dailyCreditsUsed !== undefined) {
        setCredits(prev => prev ? {
          ...prev,
          daily_credits_used: data.dailyCreditsUsed,
          monthly_bonus_used: data.monthlyBonusUsed,
        } : prev);
      }
    } catch (error) {
      console.error("Fix error:", error);
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "We couldn't process your request right now. Please try again in a few seconds.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTone = (tone: string) => {
    handleToneSelect(tone);
    if (inputText.trim() && !isLoading && cooldown <= 0) {
      setSelectedTone(tone);
      setTimeout(() => document.getElementById("fix-button")?.click(), 50);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const charCount = inputText.length;

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Credits Bar */}
          {!isPro && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                <span className="font-medium">{dailyRemaining} credits left today</span>
                {isProTone(selectedTone) && (
                  <span className="text-muted-foreground">· {monthlyBonusRemaining} bonus left</span>
                )}
              </div>
              <Button variant="hero" size="sm" asChild>
                <Link to="/pricing"><Crown className="h-4 w-4 mr-1.5" />Upgrade to Pro</Link>
              </Button>
            </div>
          )}
          {isPro && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                <Crown className="h-4 w-4" /> Pro — Unlimited fixes
              </div>
            </div>
          )}

          {/* Tone Cards */}
          <div className="mb-4">
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
              {TONES.map(tone => {
                const locked = !isPro && isProTone(tone.value);
                const selected = selectedTone === tone.value;
                const bonusExhausted = locked && (credits?.monthly_bonus_used ?? 0) >= MONTHLY_BONUS_LIMIT;
                return (
                  <button
                    key={tone.value}
                    onClick={() => handleToneSelect(tone.value)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg border text-left transition-all min-w-[140px] ${
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/50 bg-card/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{tone.emoji}</span>
                      <span className="text-xs font-semibold truncate">{tone.label}</span>
                      {locked && (
                        <Lock className={`h-3 w-3 ml-auto ${bonusExhausted ? "text-destructive" : "text-amber-500"}`} />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">{tone.description}</p>
                    {locked && !bonusExhausted && (
                      <p className="text-[9px] text-amber-600 mt-0.5">Uses bonus credits</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <Card className="glass-strong mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Textarea
                  placeholder="Type or paste your message here..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value.slice(0, 300))}
                  className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary/50 text-base pr-16"
                />
                <span className={`absolute bottom-2 right-3 text-xs ${charCount >= 280 ? "text-destructive" : "text-muted-foreground"}`}>
                  {charCount}/300
                </span>
              </div>

              {/* Fix Button */}
              <Button
                id="fix-button"
                variant="hero"
                size="lg"
                className="w-full mt-4 min-h-[52px]"
                onClick={handleFix}
                disabled={isLoading || !inputText.trim() || cooldown > 0}
              >
                {isLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Fixing...</>
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s...`
                ) : (
                  <><Sparkles className="h-5 w-5 mr-2" />Fix My Message ✨</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <div className="space-y-4 animate-slide-up">
              <Card className="glass border-border/50">
                <CardContent className="p-4">
                  <Badge variant="outline" className="text-xs text-muted-foreground mb-2">Original Message</Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{inputText}</p>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowDown className="h-5 w-5 text-primary" />
                </div>
              </div>

              <Card className="glass-strong border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <Sparkles className="h-3 w-3 mr-1" /> Texify AI Improved Message
                    </Badge>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => copyToClipboard(result.fixedMessage)}
                      className="h-9 px-4 min-h-[44px]"
                    >
                      {copied ? <><Check className="h-4 w-4 mr-1.5" />Copied!</> : <><Copy className="h-4 w-4 mr-1.5" />Copy Text</>}
                    </Button>
                  </div>
                  <p className="text-lg leading-relaxed">{result.fixedMessage}</p>
                  {!isPro && (
                    <p className="text-xs text-muted-foreground mt-3 text-right">— Fixed by Texify AI · texify.app</p>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => { setResult(null); setInputText(""); }}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Fix another message
                </Button>
              </div>
            </div>
          )}

          {/* Limit Reached Modal */}
          {showLimitReached && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="glass-strong max-w-md w-full animate-scale-in">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">You've used all your credits today 🔥</h2>
                  <p className="text-muted-foreground mb-2">
                    {limitType === "daily"
                      ? "Your 100 daily credits are exhausted. Credits reset every 24 hours."
                      : "Your 300 monthly Pro tone bonus credits are exhausted."}
                  </p>
                  <p className="text-sm font-medium mb-6">
                    Upgrade to Pro — unlimited fixes, all tones, zero watermark.
                  </p>
                  <div className="space-y-3">
                    <Button variant="hero" className="w-full min-h-[44px]" asChild>
                      <Link to="/pricing"><Crown className="h-4 w-4 mr-2" />Upgrade to Pro →</Link>
                    </Button>
                    <button className="text-sm text-muted-foreground hover:underline" onClick={() => setShowLimitReached(false)}>
                      Maybe later
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pro Feature Modal */}
          {showUpgrade && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="glass-strong max-w-md w-full animate-scale-in">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">🔒 Pro Feature</h2>
                  <p className="text-muted-foreground mb-6">
                    This tone is available in Texify Pro. Upgrade to unlock unlimited message fixes and all tone styles.
                  </p>
                  <div className="text-left mb-6 space-y-2 bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2">Upgrade to Texify Pro to unlock:</p>
                    {["Unlimited message fixes", "All 14 tone styles", "No watermark", "Faster responses"].map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Button variant="hero" className="w-full min-h-[44px]" asChild>
                      <Link to="/pricing"><Crown className="h-4 w-4 mr-2" />Upgrade to Pro</Link>
                    </Button>
                    <button className="text-sm text-muted-foreground hover:underline" onClick={() => setShowUpgrade(false)}>
                      Maybe later
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
