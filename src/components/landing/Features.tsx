import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Theater, Smartphone, Lock, CreditCard, Globe } from "lucide-react";

const features = [
  { icon: Zap, title: "Instant tone switching", description: "Switch between 14 tones in one click." },
  { icon: Theater, title: "14 unique tones", description: "Including Rizz, Savage, Confident, and more." },
  { icon: Smartphone, title: "Built perfectly for mobile", description: "Fix messages on the go, anywhere." },
  { icon: Lock, title: "Messages never stored", description: "Your messages are processed and forgotten." },
  { icon: CreditCard, title: "Free forever plan", description: "30 credits daily, always free. No catches." },
  { icon: Globe, title: "Loved by students across India", description: "Trusted by thousands of students daily." },
];

export function Features() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Say the right thing, <span className="gradient-text">every time</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop overthinking. Start sending with confidence.
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
