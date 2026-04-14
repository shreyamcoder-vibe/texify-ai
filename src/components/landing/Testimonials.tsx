import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Texify literally saved me from sending the most embarrassing text ever. Professional mode is a lifesaver!",
    name: "Arjun",
    city: "Pune",
    initial: "A",
    color: "bg-primary",
  },
  {
    quote: "I use the Rizz tone before every DM now. My replies went from cringe to smooth 😎",
    name: "Priya",
    city: "Mumbai",
    initial: "P",
    color: "bg-amber-500",
  },
  {
    quote: "Fixed my apology message to my manager and it actually worked. Got a positive reply in 10 minutes!",
    name: "Rahul",
    city: "Bangalore",
    initial: "R",
    color: "bg-green-600",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            What our users <span className="gradient-text">are saying</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-6 glass hover:border-primary/30 transition-all duration-300">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-10 text-lg">
          Loved by students across India 🇮🇳
        </p>
      </div>
    </section>
  );
}
