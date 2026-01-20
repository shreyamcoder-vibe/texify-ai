import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sliders, Sparkles, Copy } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Paste your message",
    description: "Drop in any text you want to rewrite, refine, or transform.",
  },
  {
    icon: Sliders,
    number: "02",
    title: "Choose your style",
    description: "Select from 14+ tones like Professional, Polite, Rizz, or Savage.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Click rewrite",
    description: "Our AI refines and transforms your message in seconds.",
  },
  {
    icon: Copy,
    number: "04",
    title: "Copy & use",
    description: "Get 3 polished variations. Pick your favorite and send!",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-subtle" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Four steps to <span className="gradient-text">perfect communication</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rewrite, refine, and perfect your messages in seconds. No learning curve required.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}
                
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  
                  {/* Number */}
                  <span className="text-sm font-bold text-primary mb-2 block">{step.number}</span>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
