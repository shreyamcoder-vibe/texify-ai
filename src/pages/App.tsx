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
  RefreshCw,
  Lock
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
  const [upgradeReason, setUpgradeReason] = useState<string>("");

  const isPro = profile?.is_pro ?? false;

  // Allow non-authenticated users to use the app (they can try it)
  // but show login prompt when they try to rewrite

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
        description: "Paste or type the message you want to rewrite.",
      });
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to rewrite messages.",
      });
      navigate("/auth");
      return;
    }

    // Check if user is trying to use locked features
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
          setUpgradeReason("unlimited rewrites");
          setShowUpgrade(true);
          toast({
            variant: "destructive",
            title: "Daily limit reached",
            description: "Upgrade to Pro for unlimited rewrites!",
          });
        } else if (data.lockedFeature) {
          setUpgradeReason(data.lockedFeature);
          setShowUpgrade(true);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error,
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
        title: "Something went wrong",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectedToneData = TONES.find(t => t.value === selectedTone);
  const creditsRemaining = profile 
    ? Math.max(0, FREE_DAILY_LIMIT - (profile.daily_credits_used ?? 0))
    : FREE_DAILY_LIMIT;

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
          {!isPro && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass">
                <span className="text-sm text-muted-foreground">Daily Fixes:</span>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${creditsRemaining <= 2 ? 'text-destructive' : 'text-foreground'}`}>
                    {creditsRemaining}
                  </span>
                  <span className="text-muted-foreground">/ {FREE_DAILY_LIMIT}</span>
                </div>
                <Link to="/pricing" className="text-xs text-primary hover:underline">
                  Upgrade
                </Link>
              </div>
            </div>
          )}

          {/* Input Section */}
          <Card className="glass-strong mb-6">
            <CardContent className="p-6">
              {/* Text Input */}
              <Textarea
                placeholder="Paste your message here... What are you about to send?"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[150px] mb-4 resize-none bg-background/50 border-border/50 focus:border-primary/50"
              />

              {/* Quick Tone Buttons */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Quick Fix</label>
                <QuickToneButtons 
                  onSelectTone={(tone) => {
                    setSelectedTone(tone);
                    if (!isToneLocked(tone) && inputText.trim()) {
                      handleRewrite();
                    } else if (isToneLocked(tone)) {
                      setUpgradeReason("premium tone styles");
                      setShowUpgrade(true);
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
                              {locked && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
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
                              {locked && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
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
              {/* Main Result */}
              <Card className="glass-strong border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Here's a better way to say it
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.main, 0)}
                      className="h-8"
                    >
                      {copiedIndex === 0 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="ml-1">Copy</span>
                    </Button>
                  </div>
                  <p className="text-lg leading-relaxed">{result.main}</p>
                </CardContent>
              </Card>

              {/* Alternative Results */}
              <div className="grid sm:grid-cols-2 gap-4">
                {result.alternatives.map((alt, index) => (
                  <Card key={index} className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Option {index + 2}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(alt, index + 1)}
                          className="h-7 px-2"
                        >
                          {copiedIndex === index + 1 ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">{alt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

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

          {/* Upgrade Modal */}
          {showUpgrade && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="glass-strong max-w-md w-full animate-scale-in">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                    <Crown className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
                  <p className="text-muted-foreground mb-6">
                    {upgradeReason === "unlimited rewrites" 
                      ? `You've used all ${FREE_DAILY_LIMIT} free fixes for today. Upgrade to Pro for unlimited access!`
                      : `Unlock ${upgradeReason} and more with Texify Pro!`
                    }
                  </p>
                  <div className="space-y-2 text-left mb-6 bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Unlimited message fixes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>All 14+ tone styles including Rizz, Savage, Sarcastic</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>All 20+ languages</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Faster responses & priority processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Fix history</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 italic">
                    ⚡ Payments coming soon.
                  </p>
                  <div className="space-y-3">
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/pricing">
                        View Pro Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setShowUpgrade(false)}>
                      Okay
                    </Button>
                  </div>
                  {upgradeReason === "unlimited rewrites" && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Your fixes reset in 24 hours
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
