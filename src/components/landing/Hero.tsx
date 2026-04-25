import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Hero() {
  const [messageCount, setMessageCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("requests_log" as any)
        .select("*", { count: "exact", head: true });
      setMessageCount(count ?? 0);
    };
    fetchCount();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-subtle" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-foreground/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Message Fixer</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            Say exactly what you mean.
            <br />
            <span className="gradient-text">Every time.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            AI that rewrites your messages in any tone — Rizz, Savage, Professional, Polite and 10+ more — in one click.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" asChild className="group">
              <Link to="/app">
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started For Free
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>No credit card needed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>30 free credits daily</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Pro tones from ₹49/month</span>
            </div>
          </div>

          {/* Live Counter */}
          {messageCount !== null && messageCount > 0 && (
            <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{messageCount.toLocaleString()}</span> messages fixed so far
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
