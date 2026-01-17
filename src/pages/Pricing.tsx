import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Check, Crown, Zap, Sparkles } from "lucide-react";

const features = [
  "Unlimited rewrites",
  "All 14+ tone styles",
  "20+ languages",
  "Faster AI responses",
  "Priority support",
  "No daily limits",
];

export default function PricingPage() {
  const { profile } = useAuth();
  const [currency] = useState(() => {
    // Simple geo-detection based on timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("Kolkata") || tz.includes("Asia/Calcutta")) {
      return "inr";
    }
    return "usd";
  });

  const pricing = currency === "inr" 
    ? { amount: 99, symbol: "₹", period: "month" }
    : { amount: 3.99, symbol: "$", period: "month" };

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Upgrade to <span className="gradient-text">Pro</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Unlock unlimited rewrites and take your communication to the next level.
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
                  <CardDescription>Perfect for trying out ToneShift AI</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/forever</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>10 rewrites per day</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>All 14+ tone styles</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>20+ languages</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <Check className="h-5 w-5 opacity-50" />
                      <span>Standard processing</span>
                    </li>
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
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="hero" className="w-full mt-6" disabled={profile?.is_pro}>
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

          {/* FAQ */}
          <div className="max-w-2xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">What happens when I hit my daily limit?</h3>
                <p className="text-muted-foreground">You'll see a friendly upgrade screen. Your credits reset every 24 hours, so you can wait or upgrade to Pro for unlimited access.</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">Absolutely! You can cancel your subscription at any time and continue using Pro features until the end of your billing period.</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">Is my data private?</h3>
                <p className="text-muted-foreground">Yes! We process your messages securely and don't store or share them with third parties. Your privacy is our priority.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
