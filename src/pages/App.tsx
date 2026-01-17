import { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TONES, LANGUAGES, FREE_DAILY_LIMIT } from "@/lib/constants";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Crown,
  ArrowRight,
  RefreshCw
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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter some text",
        description: "Paste or type the message you want to rewrite.",
      });
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
          setShowUpgrade(true);
          toast({
            variant: "destructive",
            title: "Daily limit reached",
            description: "Upgrade to Pro for unlimited rewrites!",
          });
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
    ? FREE_DAILY_LIMIT - (profile.daily_credits_used ?? 0)
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
              Rewrite your message
            </h1>
            <p className="text-muted-foreground">
              Paste your text, pick a tone, and let AI do the magic.
            </p>
          </div>

          {/* Credits Display */}
          {!profile?.is_pro && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass">
                <span className="text-sm text-muted-foreground">Daily Credits:</span>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${creditsRemaining <= 3 ? 'text-destructive' : 'text-foreground'}`}>
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
                placeholder="Paste your message here... (works with any language)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[150px] mb-4 resize-none bg-background/50 border-border/50 focus:border-primary/50"
              />

              {/* Controls */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {/* Tone Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tone / Style</label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[300px]">
                      {TONES.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          <div className="flex items-center gap-2">
                            <span>{tone.emoji}</span>
                            <span>{tone.label}</span>
                          </div>
                        </SelectItem>
                      ))}
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
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="glass max-h-[300px]">
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rewrite Button */}
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
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Rewrite
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
                      Main Version
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
                          Alternative {index + 1}
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
                  Start Over
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
                  <h2 className="text-2xl font-bold mb-2">Daily Limit Reached</h2>
                  <p className="text-muted-foreground mb-6">
                    You've used all 10 free rewrites for today. Upgrade to Pro for unlimited access!
                  </p>
                  <div className="space-y-3">
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/pricing">
                        Upgrade to Pro
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setShowUpgrade(false)}>
                      Maybe Later
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Your credits reset in 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
