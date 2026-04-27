import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";

import { useAuth } from "@/hooks/useAuth";
import { useCredits, calcCreditCost, FREE_CHAR_LIMIT, PRO_CHAR_LIMIT, DAILY_LIMIT } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TONES, FREE_TONES, LANGUAGES, PRICING } from "@/lib/constants";
import {
  Sparkles, Copy, Check, Loader2, Crown, ArrowDown, RefreshCw, Lock, Clock,
} from "lucide-react";

interface FixResult {
  fixedMessage: string;
  primary: string;
  english: string;
  detectedLanguage: string;
  primaryLanguage: string;
  variations?: string[];
  extraVariations?: string[];
  creditCost: number;
  dailyCreditsUsed: number;
  dailyCreditsRemaining: number | string;
  isPro: boolean;
  isProTone: boolean;
}

interface UserCredits {
  daily_credits_used: number;
  is_pro: boolean;
}

export default function AppPage() {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { isPro, used, setUsed, refresh: refreshCredits } = useCredits();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [outputLanguage, setOutputLanguage] = useState<string>("auto");
  const [result, setResult] = useState<FixResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [showBlurUpgrade, setShowBlurUpgrade] = useState(false);
  const [blurredToneName, setBlurredToneName] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const dailyRemaining = isPro ? "∞" : Math.max(0, DAILY_LIMIT - used);
  const charLimit = isPro ? PRO_CHAR_LIMIT : FREE_CHAR_LIMIT;
  const isProTone = (tone: string) => !FREE_TONES.includes(tone);

  // Refresh credits whenever the page mounts (single source of truth)
  useEffect(() => { refreshCredits(); }, [refreshCredits]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const handleFix = async () => {
    if (!inputText.trim()) {
      toast({ variant: "destructive", title: "Empty message", description: "Please enter a message to fix." });
      return;
    }
    if (!user) { navigate("/auth"); return; }

    setIsLoading(true);
    setResult(null);
    setShowBlurUpgrade(false);

    try {
      const { data, error } = await supabase.functions.invoke("fix-message", {
        body: {
          message: inputText.slice(0, 300),
          tone: selectedTone,
          outputLanguage,
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.requiresUpgrade) {
          setShowLimitReached(true);
        } else {
          toast({ variant: "destructive", title: "Error", description: data.error });
        }
        return;
      }

      setResult(data);
      setCooldown(3);

      if (data.isProTone && !data.isPro) {
        const toneObj = TONES.find(t => t.value === selectedTone);
        setBlurredToneName(toneObj?.label ?? selectedTone);
        setShowBlurUpgrade(true);
      }

      if (data.dailyCreditsUsed !== undefined) {
        setUsed(data.dailyCreditsUsed);
        refreshProfile();
      } else {
        // Fallback: re-fetch from source of truth
        refreshCredits();
      }
    } catch (err) {
      console.error("Fix error:", err);
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "We couldn't process your request right now. Please try again in a few seconds.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard." });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedLanguageMeta = useMemo(
    () => LANGUAGES.find(l => l.value === outputLanguage) ?? LANGUAGES[0],
    [outputLanguage]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const charCount = inputText.length;
  const isOutputBlurred = showBlurUpgrade && result?.isProTone && !isPro;

  // Decide whether to show single combined card or dual-language layout
  const primaryText = result?.primary ?? result?.fixedMessage ?? "";
  const englishText = result?.english ?? primaryText;
  const detectedLang = result?.detectedLanguage ?? "";
  const primaryLang = result?.primaryLanguage ?? detectedLang;
  const isPrimaryEnglish =
    primaryText.trim() === englishText.trim() ||
    /english/i.test(primaryLang);
  const showSingleCard = isPrimaryEnglish;
  const extraVariations = result?.extraVariations ?? (result?.variations?.slice(1, 3) ?? []);

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Page Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">Fix your Message</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Paste what you're about to send. Pick a tone. Send with confidence.
            </p>
          </div>

          {/* Credits row below subheading */}
          {!isPro ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                <span className="font-medium">Free Credits: {used}/30 used today</span>
              </div>
              <Button variant="hero" size="sm" asChild>
                <Link to="/pricing"><Crown className="h-4 w-4 mr-1.5" />Upgrade to Pro</Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                <Crown className="h-4 w-4" /> Pro — Unlimited fixes
              </div>
            </div>
          )}

          {/* Tone Cards (horizontal scroll) */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">All Tones</p>
            <div
              className="flex overflow-x-auto gap-[10px] py-2 scrollbar-hide -mx-4"
              style={{ paddingLeft: "16px", paddingRight: "16px", scrollPaddingLeft: "16px", scrollPaddingRight: "16px" }}
            >
              {TONES.map(tone => {
                const proTone = !isPro && isProTone(tone.value);
                const selected = selectedTone === tone.value;
                return (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={`relative flex-shrink-0 px-3 py-2.5 rounded-lg border-2 text-left transition-all min-w-[140px] ${
                      selected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border/50 bg-card/50 hover:border-primary/30"
                    }`}
                  >
                    {proTone && (
                      <div className="absolute top-1.5 right-1.5">
                        <Lock className="h-3 w-3 text-amber-500" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mb-0.5 pr-4">
                      <span className="text-sm">{tone.emoji}</span>
                      <span className="text-xs font-semibold truncate">{tone.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{tone.description}</p>
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
                  placeholder="Type or paste your message here... (any language)"
                  value={inputText}
                  onChange={e => setInputText(e.target.value.slice(0, 300))}
                  className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary/50 text-base pr-16"
                />
                <span className={`absolute bottom-2 right-3 text-xs ${charCount >= 280 ? "text-destructive" : "text-muted-foreground"}`}>
                  {charCount}/300
                </span>
              </div>

              {/* Output Language Dropdown */}
              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Output Language</label>
                <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span>{selectedLanguageMeta.flag}</span>
                        <span>{selectedLanguageMeta.label}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                id="fix-button"
                variant="hero"
                size="lg"
                className="w-full mt-4 min-h-[52px]"
                onClick={handleFix}
                disabled={isLoading || !inputText.trim() || cooldown > 0 || (typeof dailyRemaining === "number" && dailyRemaining <= 0)}
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

              {/* PRO TONE → fully blurred single card */}
              {result.isProTone && !isPro ? (
                <Card className="glass-strong border-primary/30 relative overflow-hidden min-h-[220px]">
                  <CardContent className="p-4">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-3">
                      <Sparkles className="h-3 w-3 mr-1" /> Texify AI Improved Message
                    </Badge>
                    <p className="text-lg leading-relaxed blur-[8px] select-none pointer-events-none">
                      {primaryText || "Your rewritten message will appear here. Upgrade to Pro to unlock all premium tones."}
                    </p>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-[2px] rounded-lg p-6">
                      <p className="text-lg font-bold mb-1 text-center">🔥 Your {blurredToneName} rewrite is ready</p>
                      <p className="text-sm text-muted-foreground mb-4 text-center">Upgrade to Pro to reveal it</p>
                      <Button variant="hero" className="w-full max-w-xs min-h-[44px]" asChild>
                        <Link to="/pricing"><Crown className="h-4 w-4 mr-2" />Upgrade to Pro →</Link>
                      </Button>
                      <button
                        className="text-sm text-muted-foreground hover:underline mt-3"
                        onClick={() => setShowBlurUpgrade(false)}
                      >
                        Maybe later
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : showSingleCard ? (
                /* FREE TONE — English in / English out → single card */
                <Card className="glass-strong border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        <Sparkles className="h-3 w-3 mr-1" /> Texify AI Improved Message
                      </Badge>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => copyToClipboard(primaryText, "primary")}
                        className="h-9 px-4 min-h-[44px]"
                      >
                        {copiedKey === "primary" ? <><Check className="h-4 w-4 mr-1.5" />Copied!</> : <><Copy className="h-4 w-4 mr-1.5" />Copy</>}
                      </Button>
                    </div>
                    <p className="text-lg leading-relaxed">{primaryText}</p>
                    {!isPro && (
                      <p className="text-xs text-muted-foreground mt-3 text-right">— Fixed by Texify AI · texify.app</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* FREE TONE — Two-card dual-language layout */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Native / Selected Language */}
                  <Card className="glass-strong border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[11px]">
                          🌐 {primaryLang || "Detected"} Output
                        </Badge>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => copyToClipboard(primaryText, "primary")}
                          className="h-8 px-3 min-h-[36px]"
                        >
                          {copiedKey === "primary" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-base leading-relaxed">{primaryText}</p>
                      {!isPro && (
                        <p className="text-[10px] text-muted-foreground mt-3 text-right">— Fixed by Texify AI · texify.app</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* English Output */}
                  <Card className="glass border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-[11px]">
                          🇬🇧 English Output
                        </Badge>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => copyToClipboard(englishText, "english")}
                          className="h-8 px-3 min-h-[36px]"
                        >
                          {copiedKey === "english" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-base leading-relaxed">{englishText}</p>
                      {!isPro && (
                        <p className="text-[10px] text-muted-foreground mt-3 text-right">— Fixed by Texify AI · texify.app</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Extra variations row (free tones only, not blurred) */}
              {!result.isProTone && extraVariations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {extraVariations.map((variant, idx) => {
                    const key = `var-${idx}`;
                    return (
                      <Card key={key} className="glass border-border/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Option {idx + 2}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(variant, key)}
                              className="h-7 px-2 text-xs"
                            >
                              {copiedKey === key ? <><Check className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
                            </Button>
                          </div>
                          <p className="text-sm leading-relaxed">{variant}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => { setResult(null); setInputText(""); setShowBlurUpgrade(false); }}
                >
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
                  <h2 className="text-xl font-bold mb-2">You've used all 30 credits today 🔥</h2>
                  <p className="text-muted-foreground mb-2">
                    Your 30 daily credits are exhausted. Credits reset every 24 hours.
                  </p>
                  <p className="text-sm font-medium mb-4">
                    Upgrade to Pro — unlimited fixes, all tones, zero watermark.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-6 bg-muted/30 rounded-lg p-3">
                    <div>
                      <p className="text-muted-foreground text-xs">🇮🇳 India</p>
                      <p className="font-semibold">₹{PRICING.india.monthly.amount}/mo</p>
                      <p className="text-xs text-muted-foreground">₹{PRICING.india.yearly.amount}/yr (Save {PRICING.india.yearly.save})</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">🌍 Global</p>
                      <p className="font-semibold">${PRICING.global.monthly.amount}/mo</p>
                      <p className="text-xs text-muted-foreground">${PRICING.global.yearly.amount}/yr (Save {PRICING.global.yearly.save})</p>
                    </div>
                  </div>
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
        </div>
      </main>
    </div>
  );
}
