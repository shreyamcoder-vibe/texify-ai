import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Wand2, 
  Palette, 
  Languages, 
  Sparkles, 
  Eye 
} from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "Rewrite",
    description: "Transform any message completely while keeping the original meaning intact.",
  },
  {
    icon: Wand2,
    title: "Refine",
    description: "Polish and improve your text to make it cleaner, clearer, and more impactful.",
  },
  {
    icon: Palette,
    title: "Change Tone",
    description: "From professional to savage, polite to flirty. Find the perfect voice for every situation.",
  },
  {
    icon: Languages,
    title: "Change Language",
    description: "Write in English, get output in Spanish, Hindi, or any of 20+ languages.",
  },
  {
    icon: Sparkles,
    title: "Polish Messages",
    description: "Fix grammar, enhance vocabulary, and make your messages sound more natural.",
  },
  {
    icon: Eye,
    title: "Improve Clarity",
    description: "Make your communication crystal clear so your message is understood perfectly.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="gradient-text">communicate better</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The easiest way to fix, polish, and upgrade your messages.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="p-6 glass hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
