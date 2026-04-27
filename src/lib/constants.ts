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
  { value: "auto", label: "Auto-detect my language", flag: "🌐", name: "Auto" },
  { value: "English", label: "English", flag: "🇬🇧", name: "English" },
  { value: "Hindi", label: "Hindi — हिन्दी", flag: "🇮🇳", name: "Hindi" },
  { value: "Spanish", label: "Spanish — Español", flag: "🇪🇸", name: "Spanish" },
  { value: "French", label: "French — Français", flag: "🇫🇷", name: "French" },
  { value: "German", label: "German — Deutsch", flag: "🇩🇪", name: "German" },
  { value: "Portuguese", label: "Portuguese — Português", flag: "🇵🇹", name: "Portuguese" },
  { value: "Arabic", label: "Arabic — العربية", flag: "🇸🇦", name: "Arabic" },
  { value: "Bengali", label: "Bengali — বাংলা", flag: "🇧🇩", name: "Bengali" },
  { value: "Russian", label: "Russian — Русский", flag: "🇷🇺", name: "Russian" },
  { value: "Japanese", label: "Japanese — 日本語", flag: "🇯🇵", name: "Japanese" },
  { value: "Korean", label: "Korean — 한국어", flag: "🇰🇷", name: "Korean" },
  { value: "Chinese (Simplified)", label: "Chinese (Simplified) — 中文", flag: "🇨🇳", name: "Chinese" },
  { value: "Italian", label: "Italian — Italiano", flag: "🇮🇹", name: "Italian" },
  { value: "Turkish", label: "Turkish — Türkçe", flag: "🇹🇷", name: "Turkish" },
  { value: "Dutch", label: "Dutch — Nederlands", flag: "🇳🇱", name: "Dutch" },
  { value: "Tamil", label: "Tamil — தமிழ்", flag: "🇮🇳", name: "Tamil" },
  { value: "Telugu", label: "Telugu — తెలుగు", flag: "🇮🇳", name: "Telugu" },
  { value: "Marathi", label: "Marathi — मराठी", flag: "🇮🇳", name: "Marathi" },
  { value: "Gujarati", label: "Gujarati — ગુજરાતી", flag: "🇮🇳", name: "Gujarati" },
  { value: "Punjabi", label: "Punjabi — ਪੰਜਾਬੀ", flag: "🇮🇳", name: "Punjabi" },
  { value: "Urdu", label: "Urdu — اردو", flag: "🇵🇰", name: "Urdu" },
  { value: "Indonesian", label: "Indonesian — Bahasa Indonesia", flag: "🇮🇩", name: "Indonesian" },
  { value: "Malay", label: "Malay — Bahasa Melayu", flag: "🇲🇾", name: "Malay" },
  { value: "Vietnamese", label: "Vietnamese — Tiếng Việt", flag: "🇻🇳", name: "Vietnamese" },
  { value: "Thai", label: "Thai — ภาษาไทย", flag: "🇹🇭", name: "Thai" },
  { value: "Polish", label: "Polish — Polski", flag: "🇵🇱", name: "Polish" },
  { value: "Swedish", label: "Swedish — Svenska", flag: "🇸🇪", name: "Swedish" },
  { value: "Norwegian", label: "Norwegian — Norsk", flag: "🇳🇴", name: "Norwegian" },
  { value: "Danish", label: "Danish — Dansk", flag: "🇩🇰", name: "Danish" },
] as const;

export const DAILY_CREDIT_LIMIT = 30;
export const FREE_DAILY_LIMIT = DAILY_CREDIT_LIMIT;

export const FREE_TONES: string[] = TONES.filter(t => t.free).map(t => t.value);
export const FREE_LANGUAGES: string[] = LANGUAGES.filter(l => l.free).map(l => l.value);

export const PRICING = {
  india: { monthly: { amount: 49, currency: "₹" }, yearly: { amount: 399, currency: "₹", save: "32%" } },
  global: { monthly: { amount: 3.99, currency: "$" }, yearly: { amount: 39, currency: "$", save: "32%" } },
} as const;
