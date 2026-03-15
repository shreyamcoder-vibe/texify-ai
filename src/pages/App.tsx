import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { QuickToneButtons } from "@/components/app/QuickToneButtons";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TONES, LANGUAGES, FREE_DAILY_LIMIT, FREE_TONES, FREE_LANGUAGES } from "@/lib/constants";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Crown,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  Lock,
  Clock
} from "lucide-react";

interface RewriteResult {
  main: string;
  alternatives: string[];
  creditsUsed: number;
  creditsRemaining: number | string;
}

export default function AppPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string>("");

  const isPro = profile?.is_pro ?? false;
  const creditsUsed = profile?.daily_credits_used ?? 0;
  const creditsRemaining = Math.max(0, FREE_DAILY_LIMIT - creditsUsed);

  const isToneLocked = (toneValue: string) => {
    if (isPro) return false;
    return !FREE_TONES.includes(toneValue);
  };

  const isLanguageLocked = (langValue: string) => {
    if (isPro) return false;
    return !FREE_LANGUAGES.includes(langValue);
  };

  const handleToneChange = (value: string) => {
    if (isToneLocked(value)) {
      setUpgradeReason("premium tone styles");
      setShowUpgrade(true);
      return;
    }
    setSelectedTone(value);
  };

  const handleLanguageChange = (value: string) => {
    if (isLanguageLocked(value)) {
      setUpgradeReason("all languages");
      setShowUpgrade(true);
      return;
    }
    setSelectedLanguage(value);
  };

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter some text",
        description: "Paste or type the message you want to fix.",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to fix messages.",
      });
      navigate("/auth");
      return;
    }

    if (isToneLocked(selectedTone)) {
      setUpgradeReason("premium tone styles");
      setShowUpgrade(true);
      return;
    }

    if (isLanguageLocked(selectedLanguage)) {
      setUpgradeReason("all languages");
      setShowUpgrade(true);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("rewrite-text", {
        body: {
          text: inputText,
          tone: selectedTone,
          targetLanguage: selectedLanguage,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.requiresUpgrade) {
          setShowLimitReached(true);
        } else if (data.lockedFeature) {
          setUpgradeReason(data.lockedFeature);
          setShowUpgrade(true);
        } else {
          toast({
            variant: "destructive",
            title: "Couldn't process your request",
            description: "We couldn't process your request right now. Please try again in a few seconds.",
          });
        }
        return;
      }

      setResult(data);
      refreshProfile();
    } catch (error) {
      console.error("Rewrite error:", error);
      toast({
        variant: "destructive",
        title: "Couldn't process your request",
        description: "We couldn't process your request right now. Please try again in a few seconds.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: "Copied to clipboard",
      description: "Your message has been copied and is ready to paste.",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectedToneData = TONES.find(t => t.value === selectedTone);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Fix your message
            </h1>
            <p className="text-muted-foreground">
              Paste what you're about to send. Pick a tone. Send with confidence.
            </p>
          </div>

          {/* Credits Display */}
          {!isPro && user && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full glass">
                <span className="text-sm font-medium">Free Credits:</span>
                <span className={`font-bold text-lg ${creditsRemaining <= 2 ? 'text-destructive' : 'text-primary'}`}>
                  {creditsUsed} / {FREE_DAILY_LIMIT}
                </span>
                <span className="text-sm text-muted-foreground">used today</span>
              </div>
              <Button variant="hero" size="sm" asChild>
                <Link to="/pricing">
                  <Crown className="h-4 w-4 mr-1.5" />
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          )}

          {isPro && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-primary text-primary-foreground">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Pro — Unlimited fixes</span>
              </div>
            </div>
          )}

          {/* Input Section */}
          <Card className="glass-strong mb-6">
            <CardContent className="p-4 sm:p-6">
              {/* Text Input */}
              <Textarea
                placeholder="Paste your message here... What are you about to send?"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px] sm:min-h-[150px] mb-4 resize-none bg-background/50 border-border/50 focus:border-primary/50 text-base"
              />

              {/* Quick Tone Buttons */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Quick Fix</label>
                <QuickToneButtons 
                  onSelectTone={(tone) => {
                    if (isToneLocked(tone)) {
                      setUpgradeReason("premium tone styles");
                      setShowUpgrade(true);
                      return;
                    }
                    setSelectedTone(tone);
                    if (inputText.trim()) {
                      // We need to trigger rewrite after state update
                      setTimeout(() => {
                        document.getElementById('fix-button')?.click();
                      }, 50);
                    }
                  }}
                  isToneLocked={isToneLocked}
                  disabled={isLoading || !inputText.trim()}
                />
              </div>

              {/* Controls */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {/* Tone Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tone / Style</label>
                  <Select value={selectedTone} onValueChange={handleToneChange}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[300px]">
                      {TONES.map((tone) => {
                        const locked = isToneLocked(tone.value);
                        return (
                          <SelectItem 
                            key={tone.value} 
                            value={tone.value}
                            className={locked ? "opacity-70" : ""}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span>{tone.emoji}</span>
                              <span>{tone.label}</span>
                              {locked && (
                                <span className="flex items-center gap-1 ml-auto text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  <span className="text-[10px]">Pro</span>
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedToneData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedToneData.description}
                    </p>
                  )}
                </div>

                {/* Language Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Output Language</label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[300px]">
                      {LANGUAGES.map((lang) => {
                        const locked = isLanguageLocked(lang.value);
                        return (
                          <SelectItem 
                            key={lang.value} 
                            value={lang.value}
                            className={locked ? "opacity-70" : ""}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span>{lang.label}</span>
                              {locked && (
                                <span className="flex items-center gap-1 ml-auto text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  <span className="text-[10px]">Pro</span>
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fix Button */}
              <Button 
                id="fix-button"
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={handleRewrite}
                disabled={isLoading || !inputText.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Fix my message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="space-y-4 animate-slide-up">
              {/* Original Message */}
              <Card className="glass border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Original Message
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{inputText}</p>
                </CardContent>
              </Card>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowDown className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* Main Result */}
              <Card className="glass-strong border-primary/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Texify AI Improved Message
                    </Badge>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => copyToClipboard(result.main, 0)}
                      className="h-9 px-4"
                    >
                      {copiedIndex === 0 ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5 text-primary" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1.5" />
                          Copy Text
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-lg leading-relaxed">{result.main}</p>
                </CardContent>
              </Card>

              {/* Alternative Results */}
              {result.alternatives.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.alternatives.map((alt, index) => (
                    <Card key={index} className="glass">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            Option {index + 2}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(alt, index + 1)}
                            className="h-8 px-3"
                          >
                            {copiedIndex === index + 1 ? (
                              <>
                                <Check className="h-3 w-3 mr-1 text-green-500" />
                                <span className="text-xs">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                <span className="text-xs">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed">{alt}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Try Again Button */}
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResult(null);
                    setInputText("");
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fix another message
                </Button>
              </div>
            </div>
          )}

          {/* Daily Limit Reached Modal */}
          {showLimitReached && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="glass-strong max-w-md w-full animate-scale-in">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3">You've used all 5 free message fixes today</h2>
                  <p className="text-muted-foreground mb-6">
                    Free credits reset every 24 hours.
                  </p>
                  <p className="text-sm font-medium mb-6">
                    Upgrade to Pro for unlimited message fixes.
                  </p>
                  <div className="space-y-3">
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/pricing">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShowLimitReached(false)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Come back tomorrow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pro Feature Upgrade Modal */}
          {showUpgrade && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="glass-strong max-w-md w-full animate-scale-in">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">🔒 Pro Feature</h2>
                  <p className="text-muted-foreground mb-6">
                    This tone is available in Texify Pro. Upgrade to unlock unlimited message fixes and all tone styles.
                  </p>
                  <div className="text-left mb-6 space-y-2.5 bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3">Upgrade to Texify Pro to unlock:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>Unlimited message fixes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>All tone styles (Savage, Flirty, Confident...)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>Faster responses</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/pricing">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setShowUpgrade(false)}>
                      Maybe later
                    </Button>
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
