import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-90" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur mb-8">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Free to start</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to transform your communication?
          </h2>
          
          <p className="text-lg text-primary-foreground/80 mb-10">
            Join thousands of people who use Texify AI to rewrite, refine, and 
            perfect their messages every single day. Start with 5 free rewrites.
          </p>
          
          <Button 
            size="xl" 
            asChild 
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 group"
          >
            <Link to="/app">
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
