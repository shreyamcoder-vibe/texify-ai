import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const useCases = [
  {
    emoji: "🧑‍💼",
    title: "Reply to your boss professionally",
  },
  {
    emoji: "❤️",
    title: "Reply to your crush without sounding desperate",
  },
  {
    emoji: "😡",
    title: "Calm down an angry message before sending",
  },
  {
    emoji: "✉️",
    title: "Fix a professional email in seconds",
  },
  {
    emoji: "🤝",
    title: "Handle an argument politely",
  },
  {
    emoji: "😎",
    title: "Sound confident and sharp",
  },
];

export function UseCases() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Use Cases</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            When should you use <span className="gradient-text">Texify?</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {useCases.map((useCase) => (
            <Card 
              key={useCase.title} 
              className="p-5 glass hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{useCase.emoji}</span>
                <p className="font-medium">{useCase.title}</p>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-10 text-lg">
          Whatever you're about to send — Texify fixes it before it goes out.
        </p>
      </div>
    </section>
  );
}
