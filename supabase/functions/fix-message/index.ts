import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TONE_PROMPTS: Record<string, string> = {
  polite: "Rewrite this message to sound warm, respectful and polite. Keep it short. No explanations.",
  professional: "Rewrite this message in a clean, formal, workplace-appropriate tone. Keep it concise. No explanations.",
  friendly: "Rewrite this message in a casual, friendly, approachable tone. Keep it natural. No explanations.",
  flirty: "Rewrite this message to sound smooth, charming and confident — with a natural rizz energy. Keep it short. No explanations.",
  savage: "Rewrite this message with zero filter, maximum impact, brutally direct. Short. No explanations.",
  calm: "Rewrite this message in a calm, composed, de-escalating tone. No explanations.",
  confident: "Rewrite this message to sound assertive and self-assured. Direct. No explanations.",
  persuasive: "Rewrite this message to be highly convincing and compelling. Short. No explanations.",
  sarcastic: "Rewrite this message with clever, dry sarcasm. Keep it sharp. No explanations.",
  emotional: "Rewrite this message with empathy and emotional awareness. No explanations.",
  apology: "Rewrite this as a genuine, heartfelt apology. No explanations.",
  boundary: "Rewrite this to firmly and clearly set a boundary. Calm but firm. No explanations.",
  crisp: "Rewrite this message in the shortest, most direct way possible. No filler. No explanations.",
  negotiation: "Rewrite this for a negotiation — professional, persuasive, maintains respect. No explanations.",
};

const FREE_TONES = ["polite", "professional", "friendly"];
const PRO_CHAR_LIMIT = 5000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Guest-mode: no JWT verification. Open endpoint for demo.
    const { message, tone, outputLanguage } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!tone || !TONE_PROMPTS[tone]) {
      return new Response(
        JSON.stringify({ error: "Invalid tone." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (message.length > PRO_CHAR_LIMIT) {
      return new Response(
        JSON.stringify({ error: `Message must be ${PRO_CHAR_LIMIT} characters or less.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetLanguage = typeof outputLanguage === "string" && outputLanguage.trim() ? outputLanguage.trim() : "auto";
    const isProTone = !FREE_TONES.includes(tone);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseToneInstruction = TONE_PROMPTS[tone];
    const wantVariations = !isProTone;

    const languageInstruction = targetLanguage === "auto"
      ? `Detect the language of the input message. The "primary" rewrite must be written in that SAME detected language.`
      : `The "primary" rewrite must be written in ${targetLanguage}, regardless of the input language.`;

    const variationsField = wantVariations
      ? `\n  "extraVariations": [string, string]   // exactly 2 ADDITIONAL distinct rewrites in the same language as "primary"`
      : `\n  "extraVariations": []`;

    const systemPrompt = `You rewrite messages with a specific tone and produce STRICT JSON output.
Tone instruction: ${baseToneInstruction}
${languageInstruction}
Always also produce an English version.

Return ONLY a valid JSON object (no markdown fences, no commentary) with this exact shape:
{
  "detectedLanguage": string,
  "primaryLanguage": string,
  "primary": string,
  "english": string,${variationsField}
}
Keep all rewrites short and natural. No preamble, no explanations, no labels inside the strings.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "We couldn't process your request right now. Please try again in a few seconds." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content?.trim();
    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "No response from AI." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const cleaned = rawContent.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      try { parsed = JSON.parse(cleaned); } catch { /* ignore */ }
    }

    const primary = (parsed?.primary ?? rawContent).toString().trim();
    const english = (parsed?.english ?? primary).toString().trim();
    const detectedLanguage = (parsed?.detectedLanguage ?? "").toString().trim() || (targetLanguage === "auto" ? "Detected" : targetLanguage);
    const primaryLanguage = (parsed?.primaryLanguage ?? (targetLanguage === "auto" ? detectedLanguage : targetLanguage)).toString().trim();
    const extraVariations: string[] = Array.isArray(parsed?.extraVariations)
      ? parsed.extraVariations.map((s: any) => String(s).trim()).filter((s: string) => s.length > 0).slice(0, 2)
      : [];

    return new Response(
      JSON.stringify({
        fixedMessage: primary,
        primary,
        english,
        detectedLanguage,
        primaryLanguage,
        variations: [primary, ...extraVariations],
        extraVariations,
        creditCost: 0,
        isPro: false,
        isProTone,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fix-message error:", error);
    return new Response(
      JSON.stringify({ error: "We couldn't process your request right now. Please try again in a few seconds." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
