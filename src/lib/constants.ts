export const TONES = [
  // Free tones
  { value: "polite", label: "Polite", emoji: "🙏", description: "Warm and respectful", free: true },
  { value: "professional", label: "Professional", emoji: "💼", description: "Clean and workplace-ready", free: true },
  { value: "friendly", label: "Friendly", emoji: "😊", description: "Casual and approachable", free: true },
  // Pro tones
  { value: "flirty", label: "Rizz / Flirty", emoji: "😏", description: "Smooth, charming, confident", free: false },
  { value: "savage", label: "Savage", emoji: "🔥", description: "Zero filter. Maximum impact.", free: false },
  { value: "calm", label: "Calm", emoji: "😌", description: "De-escalate any situation", free: false },
  { value: "confident", label: "Confident", emoji: "💪", description: "Assertive and self-assured", free: false },
  { value: "persuasive", label: "Persuasive", emoji: "🤝", description: "Compelling and convincing", free: false },
  { value: "sarcastic", label: "Sarcastic", emoji: "🙄", description: "Sharp and dry", free: false },
  { value: "emotional", label: "Emotionally Intelligent", emoji: "💗", description: "Empathetic and aware", free: false },
  { value: "apology", label: "Apology", emoji: "🙏", description: "Genuine and heartfelt", free: false },
  { value: "boundary", label: "Boundary-setting", emoji: "🛡️", description: "Firm but calm", free: false },
  { value: "crisp", label: "Short & Crisp", emoji: "⚡", description: "Shortest possible version", free: false },
  { value: "negotiation", label: "Negotiation", emoji: "🤝", description: "Win deals, keep respect", free: false },
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

export const DAILY_CREDIT_LIMIT = 30;
export const FREE_DAILY_LIMIT = DAILY_CREDIT_LIMIT;

export const FREE_TONES: string[] = TONES.filter(t => t.free).map(t => t.value);
export const FREE_LANGUAGES: string[] = LANGUAGES.filter(l => l.free).map(l => l.value);

export const PRICING = {
  india: { monthly: { amount: 49, currency: "₹" }, yearly: { amount: 399, currency: "₹", save: "32%" } },
  global: { monthly: { amount: 3.99, currency: "$" }, yearly: { amount: 39, currency: "$", save: "32%" } },
} as const;
