export const TONES = [
  { value: "polite", label: "Polite", emoji: "🙏", description: "Respectful and courteous" },
  { value: "professional", label: "Professional", emoji: "💼", description: "Corporate and formal" },
  { value: "calm", label: "Calm", emoji: "😌", description: "Peaceful and composed" },
  { value: "confident", label: "Confident", emoji: "💪", description: "Assertive and self-assured" },
  { value: "assertive", label: "Assertive", emoji: "🎯", description: "Direct and clear" },
  { value: "friendly", label: "Friendly", emoji: "😊", description: "Warm and approachable" },
  { value: "persuasive", label: "Persuasive", emoji: "🤝", description: "Convincing and compelling" },
  { value: "flirty", label: "Flirty / Rizz", emoji: "😏", description: "Charming and playful" },
  { value: "sarcastic", label: "Sarcastic", emoji: "🙄", description: "Witty and ironic" },
  { value: "savage", label: "Savage", emoji: "🔥", description: "Clever and bold" },
  { value: "emotional", label: "Emotionally Intelligent", emoji: "💗", description: "Empathetic and understanding" },
  { value: "apology", label: "Apology", emoji: "🙏", description: "Sincere and remorseful" },
  { value: "boundary", label: "Boundary-setting", emoji: "🛡️", description: "Firm but respectful" },
  { value: "crisp", label: "Short & Crisp", emoji: "⚡", description: "Concise and punchy" },
] as const;

export const LANGUAGES = [
  { value: "auto", label: "Auto-detect Input Language" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish (Español)" },
  { value: "fr", label: "French (Français)" },
  { value: "de", label: "German (Deutsch)" },
  { value: "it", label: "Italian (Italiano)" },
  { value: "pt", label: "Portuguese (Português)" },
  { value: "ru", label: "Russian (Русский)" },
  { value: "zh", label: "Chinese (中文)" },
  { value: "ja", label: "Japanese (日本語)" },
  { value: "ko", label: "Korean (한국어)" },
  { value: "ar", label: "Arabic (العربية)" },
  { value: "hi", label: "Hindi (हिन्दी)" },
  { value: "bn", label: "Bengali (বাংলা)" },
  { value: "tr", label: "Turkish (Türkçe)" },
  { value: "vi", label: "Vietnamese (Tiếng Việt)" },
  { value: "th", label: "Thai (ไทย)" },
  { value: "nl", label: "Dutch (Nederlands)" },
  { value: "pl", label: "Polish (Polski)" },
  { value: "sv", label: "Swedish (Svenska)" },
] as const;

export const FREE_DAILY_LIMIT = 10;

export const PRICING = {
  india: { amount: 99, currency: "₹", period: "month" },
  us: { amount: 3.99, currency: "$", period: "month" },
  default: { amount: 3.99, currency: "$", period: "month" },
} as const;
