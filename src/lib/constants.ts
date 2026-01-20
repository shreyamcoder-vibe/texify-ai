export const TONES = [
  { value: "polite", label: "Polite", emoji: "🙏", description: "Respectful and courteous", free: true },
  { value: "professional", label: "Professional", emoji: "💼", description: "Corporate and formal", free: true },
  { value: "friendly", label: "Friendly", emoji: "😊", description: "Warm and approachable", free: true },
  { value: "calm", label: "Calm", emoji: "😌", description: "Peaceful and composed", free: false },
  { value: "confident", label: "Confident", emoji: "💪", description: "Assertive and self-assured", free: false },
  { value: "assertive", label: "Assertive", emoji: "🎯", description: "Direct and clear", free: false },
  { value: "persuasive", label: "Persuasive", emoji: "🤝", description: "Convincing and compelling", free: false },
  { value: "flirty", label: "Flirty / Rizz", emoji: "😏", description: "Charming and playful", free: false },
  { value: "sarcastic", label: "Sarcastic", emoji: "🙄", description: "Witty and ironic", free: false },
  { value: "savage", label: "Savage", emoji: "🔥", description: "Clever and bold", free: false },
  { value: "emotional", label: "Emotionally Intelligent", emoji: "💗", description: "Empathetic and understanding", free: false },
  { value: "apology", label: "Apology", emoji: "🙏", description: "Sincere and remorseful", free: false },
  { value: "boundary", label: "Boundary-setting", emoji: "🛡️", description: "Firm but respectful", free: false },
  { value: "crisp", label: "Short & Crisp", emoji: "⚡", description: "Concise and punchy", free: false },
] as const;

export const LANGUAGES = [
  { value: "auto", label: "Auto-detect Input Language", free: true },
  { value: "en", label: "English", free: true },
  { value: "hi", label: "Hindi (हिन्दी)", free: true },
  { value: "bn", label: "Bengali (বাংলা)", free: true },
  { value: "es", label: "Spanish (Español)", free: false },
  { value: "fr", label: "French (Français)", free: false },
  { value: "de", label: "German (Deutsch)", free: false },
  { value: "it", label: "Italian (Italiano)", free: false },
  { value: "pt", label: "Portuguese (Português)", free: false },
  { value: "ru", label: "Russian (Русский)", free: false },
  { value: "zh", label: "Chinese (中文)", free: false },
  { value: "ja", label: "Japanese (日本語)", free: false },
  { value: "ko", label: "Korean (한국어)", free: false },
  { value: "ar", label: "Arabic (العربية)", free: false },
  { value: "tr", label: "Turkish (Türkçe)", free: false },
  { value: "vi", label: "Vietnamese (Tiếng Việt)", free: false },
  { value: "th", label: "Thai (ไทย)", free: false },
  { value: "nl", label: "Dutch (Nederlands)", free: false },
  { value: "pl", label: "Polish (Polski)", free: false },
  { value: "sv", label: "Swedish (Svenska)", free: false },
] as const;

export const FREE_DAILY_LIMIT = 5;

export const FREE_TONES: string[] = TONES.filter(t => t.free).map(t => t.value);
export const FREE_LANGUAGES: string[] = LANGUAGES.filter(l => l.free).map(l => l.value);

export const PRICING = {
  india: { amount: 99, currency: "₹", period: "month" },
  us: { amount: 3.99, currency: "$", period: "month" },
  default: { amount: 3.99, currency: "$", period: "month" },
} as const;
