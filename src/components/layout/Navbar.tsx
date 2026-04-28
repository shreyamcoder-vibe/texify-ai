import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCredits, DAILY_LIMIT } from "@/hooks/useCredits";
import { Sparkles, Crown } from "lucide-react";

export function Navbar() {
  const { isPro, used } = useCredits();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute inset-0 blur-lg bg-primary/30 animate-pulse-slow" />
            </div>
            <span className="text-xl font-bold gradient-text">Texify AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>

            {isPro ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                <Crown className="h-4 w-4" />
                <span>✨ Pro Plan — Unlimited</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium">
                <span>Credits Left: {Math.max(0, DAILY_LIMIT - used)}/{DAILY_LIMIT}</span>
              </div>
            )}

            <Button variant="ghost" asChild>
              <Link to="/app">App</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
