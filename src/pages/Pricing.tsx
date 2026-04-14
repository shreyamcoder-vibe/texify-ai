import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { PRICING } from "@/lib/constants";
import { Check, X, Crown, Zap, Sparkles, Star, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const freeFeatures = [
  { text: "30 credits per day", included: true },
  { text: "3 tones: Polite, Professional, Friendly", included: true },
  { text: "Watermark on output", included: true },
  { text: "Standard processing speed", included: true },
  { text: "All 14 tone styles", included: false },
  { text: "Unlimited message fixes", included: false },
  { text: "No watermark", included: false },
  { text: "Priority processing", included: false },
];

const proFeatures = [
  { text: "Unlimited message fixes", included: true },
  { text: "All 14 tones unlocked", included: true },
  { text: "No watermark", included: true },
  { text: "Faster AI responses", included: true },
  { text: "Priority processing", included: true },
];

export default function PricingPage() {
  const { profile } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Simple <span className="gradient-text">pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground mt-2 underline decoration-dotted cursor-help inline-block">
                  1 credit = 1 message fix
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Each message fix costs 1 credit (up to 100 chars), 2 credits (101-200 chars), or 3 credits (201-300 chars).</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 p-1 rounded-full glass">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === "yearly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  billingPeriod === "yearly"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}>
                  Save 18%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <Card className="glass relative">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">Free</CardTitle>
                    <Zap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹0</span>
                    <span className="text-muted-foreground ml-1">forever</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {freeFeatures.map((f) => (
                      <li key={f.text} className={`flex items-center gap-3 ${!f.included ? "text-muted-foreground" : ""}`}>
                        {f.included ? (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <X className="h-5 w-5 opacity-30 shrink-0" />
                        )}
                        <span className={!f.included ? "line-through opacity-60" : ""}>{f.text}</span>
                        {!f.included && <Lock className="h-3 w-3 ml-auto opacity-30" />}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-6" asChild>
                    <Link to="/app">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Monthly / Yearly */}
              {billingPeriod === "monthly" ? (
                <Card className="glass-strong border-primary/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <div className="gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      POPULAR
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        Pro <Crown className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🇮🇳</span>
                        <span className="text-3xl font-bold">₹{PRICING.india.monthly.amount}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🌍</span>
                        <span className="text-lg font-semibold">${PRICING.global.monthly.amount}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {proFeatures.map((f) => (
                        <li key={f.text} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="hero"
                      className="w-full mt-6"
                      disabled={profile?.is_pro}
                      onClick={() => !profile?.is_pro && setShowComingSoon(true)}
                    >
                      {profile?.is_pro ? <><Crown className="h-4 w-4 mr-2" />Current Plan</> : "Upgrade to Pro"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">Cancel anytime. No questions asked.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-strong border-primary/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <div className="gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      POPULAR
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        Pro <Crown className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🇮🇳</span>
                        <span className="text-3xl font-bold">₹{PRICING.india.yearly.amount}</span>
                        <span className="text-muted-foreground">/year</span>
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Save {PRICING.india.yearly.save}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🌍</span>
                        <span className="text-lg font-semibold">${PRICING.global.yearly.amount}</span>
                        <span className="text-muted-foreground text-sm">/year</span>
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Save {PRICING.global.yearly.save}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {proFeatures.map((f) => (
                        <li key={f.text} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="hero"
                      className="w-full mt-6"
                      disabled={profile?.is_pro}
                      onClick={() => !profile?.is_pro && setShowComingSoon(true)}
                    >
                      {profile?.is_pro ? <><Crown className="h-4 w-4 mr-2" />Current Plan</> : "Get Best Value"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">Cancel anytime. No questions asked.</p>
                  </CardContent>
                </Card>
              )}

              {/* Pro Yearly when monthly selected, or vice versa */}
              <Card className={`glass relative ${billingPeriod === "yearly" ? "border-amber-500/30" : ""}`}>
                {billingPeriod === "yearly" && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      🔥 Best Value
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {billingPeriod === "monthly" ? "Pro Yearly" : "Pro Monthly"}
                  </CardTitle>
                  <div className="mt-4 space-y-1">
                    {billingPeriod === "monthly" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🇮🇳</span>
                          <span className="text-2xl font-bold">₹{PRICING.india.yearly.amount}</span>
                          <span className="text-muted-foreground text-sm">/year</span>
                          <Badge variant="outline" className="text-xs">Save {PRICING.india.yearly.save}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🌍</span>
                          <span className="text-lg font-semibold">${PRICING.global.yearly.amount}</span>
                          <span className="text-muted-foreground text-sm">/year</span>
                          <Badge variant="outline" className="text-xs">Save {PRICING.global.yearly.save}</Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🇮🇳</span>
                          <span className="text-2xl font-bold">₹{PRICING.india.monthly.amount}</span>
                          <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🌍</span>
                          <span className="text-lg font-semibold">${PRICING.global.monthly.amount}</span>
                          <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {proFeatures.map((f) => (
                      <li key={f.text} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full mt-6"
                    disabled={profile?.is_pro}
                    onClick={() => !profile?.is_pro && setShowComingSoon(true)}
                  >
                    {billingPeriod === "monthly" ? "Get Best Value" : "Upgrade to Pro"}
                  </Button>
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
                <h3 className="font-semibold mb-2">Do credits roll over to the next day?</h3>
                <p className="text-muted-foreground">No. Daily credits reset every 24 hours.</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">Can I try Pro tones for free?</h3>
                <p className="text-muted-foreground">You can click any Pro tone and see your rewrite is ready — upgrade to reveal the full output.</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">What is 1 credit?</h3>
                <p className="text-muted-foreground">1 credit = 1 message fix (up to 100 characters). Longer messages cost 2-3 credits.</p>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">Is there a free plan forever?</h3>
                <p className="text-muted-foreground">Yes. 30 credits daily, always free. No credit card needed.</p>
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
