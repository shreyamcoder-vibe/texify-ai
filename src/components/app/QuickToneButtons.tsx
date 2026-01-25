import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface QuickToneButtonsProps {
  onSelectTone: (tone: string) => void;
  isToneLocked: (tone: string) => boolean;
  disabled?: boolean;
}

const quickTones = [
  { value: "polite", label: "Make it Polite", emoji: "🎯" },
  { value: "professional", label: "Make it Professional", emoji: "🧑‍💼" },
  { value: "confident", label: "Make it Confident", emoji: "😎" },
  { value: "flirty", label: "Make it Flirty", emoji: "❤️" },
  { value: "calm", label: "Calm this down", emoji: "😡" },
  { value: "savage", label: "Make it Savage", emoji: "🔥" },
];

export function QuickToneButtons({ onSelectTone, isToneLocked, disabled }: QuickToneButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickTones.map((tone) => {
        const locked = isToneLocked(tone.value);
        return (
          <Button
            key={tone.value}
            variant="outline"
            size="sm"
            onClick={() => onSelectTone(tone.value)}
            disabled={disabled}
            className="text-xs h-8 px-3 bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <span className="mr-1.5">{tone.emoji}</span>
            {tone.label}
            {locked && <Lock className="h-3 w-3 ml-1.5 opacity-50" />}
          </Button>
        );
      })}
    </div>
  );
}
