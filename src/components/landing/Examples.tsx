import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const examples = [
  {
    tone: "Polite",
    emoji: "🙏",
    original: "You're wrong about this. That's not how it works.",
    rewritten: "I appreciate your perspective, though I see things a bit differently. Perhaps we could discuss this further to find common ground? I'd love to understand your viewpoint better.",
  },
  {
    tone: "Professional",
    emoji: "💼",
    original: "Hey, I can't make it to the meeting tomorrow, something came up.",
    rewritten: "Dear Team, I regret to inform you that I will be unable to attend tomorrow's meeting due to an unexpected commitment. I will review the meeting notes and follow up on any action items. Best regards.",
  },
  {
    tone: "Flirty / Rizz",
    emoji: "😏",
    original: "I think you're really nice and I'd like to hang out sometime.",
    rewritten: "You know what? There's something about you that makes me want to see more. How about we turn 'sometime' into 'this weekend'? 😏",
  },
  {
    tone: "Savage",
    emoji: "🔥",
    original: "You keep saying you'll help but you never do.",
    rewritten: "Your promises have more gaps than a Swiss cheese factory. But hey, at least you're consistent—consistently absent when it matters. 🔥",
  },
];

export function Examples() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-subtle" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Before & After</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            See the <span className="gradient-text">magic</span> in action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how Texify AI transforms everyday messages into perfectly crafted communication.
          </p>
        </div>

        {/* Tone Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {examples.map((example, index) => (
            <button
              key={example.tone}
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeIndex === index
                  ? "gradient-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card border border-border hover:border-primary/50"
              }`}
            >
              {example.emoji} {example.tone}
            </button>
          ))}
        </div>

        {/* More styles text */}
        <p className="text-center text-sm text-muted-foreground mb-12">
          And many more styles inside the app…
        </p>

        {/* Example Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Original */}
            <Card className="p-6 glass animate-scale-in" key={`original-${activeIndex}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                <span className="text-sm font-medium text-muted-foreground">Original</span>
              </div>
              <p className="text-lg leading-relaxed">{examples[activeIndex].original}</p>
            </Card>

            {/* Arrow */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                <ArrowRight className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>

            {/* Rewritten */}
            <Card className="p-6 glass-strong border-primary/20 animate-scale-in" key={`rewritten-${activeIndex}`} style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full gradient-primary" />
                <span className="text-sm font-medium text-primary">{examples[activeIndex].tone}</span>
              </div>
              <p className="text-lg leading-relaxed">{examples[activeIndex].rewritten}</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
