import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Check, X, Crown, Zap, Sparkles, Lock } from "lucide-react";

const freeFeatures = [
  { text: "5 message fixes per day", included: true },
  { text: "3 tone styles (Polite, Professional, Friendly)", included: true },
  { text: "3 languages (English, Hindi, Bengali)", included: true },
  { text: "Standard processing", included: true },
  { text: "Premium tones (Rizz, Savage, Sarcastic...)", included: false },
  { text: "All 20+ languages", included: false },
  { text: "Fix history", included: false },
  { text: "Priority processing", included: false },
];

const proFeatures = [
  { text: "Unlimited message fixes", included: true },
  { text: "All 14+ tone styles", included: true },
  { text: "All 20+ languages", included: true },
  { text: "Faster responses", included: true },
  { text: "Fix history", included: true },
  { text: "Priority processing", included: true },
];

export default function PricingPage() {
  const { profile, user } = useAuth();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const pricing = { amount: 3.99, symbol: "$", period: "month" };

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Simple <span className="gradient-text">pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card className="glass relative">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">Free</CardTitle>
                    <Zap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {freeFeatures.map((feature) => (
                      <li key={feature.text} className={`flex items-center gap-3 ${!feature.included ? "text-muted-foreground" : ""}`}>
                        {feature.included ? (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <X className="h-5 w-5 opacity-30 shrink-0" />
                        )}
                        <span className={!feature.included ? "line-through opacity-60" : ""}>{feature.text}</span>
                        {!feature.included && <Lock className="h-3 w-3 ml-auto opacity-30" />}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-6" asChild>
                    <Link to="/app">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="glass-strong border-primary/50 relative overflow-hidden">
                {/* Popular Badge */}
                <div className="absolute top-0 right-0">
                  <div className="gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Pro
                      <Crown className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardDescription>For power users who communicate a lot</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{pricing.symbol}{pricing.amount}</span>
                    <span className="text-muted-foreground">/{pricing.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {proFeatures.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="hero" 
                    className="w-full mt-6" 
                    disabled={profile?.is_pro}
                    onClick={() => !profile?.is_pro && setShowComingSoon(true)}
                  >
                    {profile?.is_pro ? (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      "Upgrade to Pro"
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Cancel anytime. No questions asked.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coming Soon Modal */}
          {showComingSoon && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="glass-strong max-w-md w-full animate-scale-in">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                    <Crown className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Pro plan coming soon</h2>
                  <p className="text-muted-foreground mb-6">
                    Payments are not live yet. You'll be able to upgrade very soon.
                  </p>
                  <Button variant="hero" className="w-full" onClick={() => setShowComingSoon(false)}>
                    Okay
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* FAQ */}
          <div className="max-w-2xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">What happens when I hit my daily limit?</h3>
                <p className="text-muted-foreground">You'll see an upgrade prompt. Your fixes reset every 24 hours, or you can upgrade to Pro for unlimited access.</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">What's included in the free plan?</h3>
                <p className="text-muted-foreground">5 message fixes per day, 3 tone styles (Polite, Professional, Friendly), and 3 languages (English, Hindi, Bengali).</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">Yes. Cancel your subscription at any time and keep using Pro features until the end of your billing period.</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">Is my data private?</h3>
                <p className="text-muted-foreground">Yes. We process your messages securely and don't store or share them with third parties.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
