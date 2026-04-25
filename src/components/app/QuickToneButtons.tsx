import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface QuickToneButtonsProps {
  onSelectTone: (tone: string) => void;
  isToneLocked: (tone: string) => boolean;
  selectedTone?: string;
  disabled?: boolean;
}

const quickTones = [
  { value: "polite", label: "Make it Polite", emoji: "🙏" },
  { value: "professional", label: "Make it Professional", emoji: "💼" },
  { value: "confident", label: "Make it Confident", emoji: "💪" },
  { value: "flirty", label: "Make it Flirty", emoji: "❤️" },
  { value: "calm", label: "Calm this down", emoji: "😌" },
  { value: "savage", label: "Make it Savage", emoji: "🔥" },
];

export function QuickToneButtons({ onSelectTone, isToneLocked, selectedTone, disabled }: QuickToneButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickTones.map((tone) => {
        const locked = isToneLocked(tone.value);
        const selected = selectedTone === tone.value;
        return (
          <Button
            key={tone.value}
            variant="outline"
            size="sm"
            onClick={() => onSelectTone(tone.value)}
            disabled={disabled}
            className={`text-xs h-9 px-3 transition-all ${
              selected
                ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                : locked
                  ? "bg-muted/40 border-border/50 hover:bg-muted/70"
                  : "bg-background/50 hover:bg-primary/10 hover:border-primary/50"
            }`}
          >
            <span className="mr-1.5">{tone.emoji}</span>
            {tone.label}
            {locked && (
              <span className="flex items-center gap-0.5 ml-1.5 text-amber-600">
                <Lock className="h-3 w-3" />
                <span className="text-[10px] font-semibold">Pro</span>
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
