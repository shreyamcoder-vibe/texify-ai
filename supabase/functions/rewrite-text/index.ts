import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Texify AI, an expert human communication editor. Your job is to rewrite user messages while preserving the original meaning, but changing tone, style, emotional impact, clarity, and social intelligence. Never change the core intent. Never add new facts. Adapt culturally to the target language. If the user selects Sarcastic or Flirty, make it natural and human, not cringe. If Professional, make it sound like a high-level corporate communicator. If Polite, remove harshness. If Savage, keep it clever and non-abusive. Always output in the target language. First analyze the emotional tone internally, then adapt.

IMPORTANT: You must respond ONLY with valid JSON in this exact format, no other text:
{
  "main": "The main rewritten version",
  "alternative1": "First alternative version", 
  "alternative2": "Second alternative version"
}

Never explain, never add commentary. Only output the JSON object.`;

// Free tier limits
const FREE_DAILY_LIMIT = 5;
const FREE_TONES = ["polite", "professional", "friendly"];
const FREE_LANGUAGES = ["auto", "en", "hi", "bn"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader ?? "" } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile and check credits
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to get user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isPro = profile?.is_pro ?? false;

    // Check if credits need to be reset (new day)
    const now = new Date();
    const resetAt = profile?.credits_reset_at ? new Date(profile.credits_reset_at) : new Date(0);
    const isNewDay = now.toDateString() !== resetAt.toDateString();
    
    let currentCreditsUsed = profile?.daily_credits_used ?? 0;
    
    if (isNewDay) {
      currentCreditsUsed = 0;
      await supabaseClient
        .from("profiles")
        .update({ daily_credits_used: 0, credits_reset_at: now.toISOString() })
        .eq("user_id", user.id);
    }

    // Check credit limit for non-pro users
    if (!isPro && currentCreditsUsed >= FREE_DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ 
          error: "Daily limit reached",
          requiresUpgrade: true,
          creditsUsed: currentCreditsUsed,
          limit: FREE_DAILY_LIMIT
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, tone, targetLanguage } = await req.json();

    if (!text || !tone || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if free user is trying to use premium features
    if (!isPro) {
      if (!FREE_TONES.includes(tone)) {
        return new Response(
          JSON.stringify({ 
            error: "Premium tone required",
            lockedFeature: "premium tone styles",
            requiresUpgrade: true
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!FREE_LANGUAGES.includes(targetLanguage)) {
        return new Response(
          JSON.stringify({ 
            error: "Premium language required",
            lockedFeature: "all languages",
            requiresUpgrade: true
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const userPrompt = `Input message: ${text}
Target tone/style: ${tone}
Target output language: ${targetLanguage}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
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
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let parsedContent;
    try {
      // Clean up potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback: use the content as-is
      parsedContent = {
        main: content,
        alternative1: content,
        alternative2: content
      };
    }

    // Update credits used
    await supabaseClient
      .from("profiles")
      .update({ daily_credits_used: currentCreditsUsed + 1 })
      .eq("user_id", user.id);

    // Save to history (only for pro users)
    if (isPro) {
      await supabaseClient
        .from("rewrite_history")
        .insert({
          user_id: user.id,
          original_text: text,
          tone,
          target_language: targetLanguage,
          rewritten_text: parsedContent.main,
          alternatives: [parsedContent.alternative1, parsedContent.alternative2]
        });
    }

    return new Response(
      JSON.stringify({
        main: parsedContent.main,
        alternatives: [parsedContent.alternative1, parsedContent.alternative2],
        creditsUsed: currentCreditsUsed + 1,
        creditsRemaining: isPro ? "unlimited" : FREE_DAILY_LIMIT - (currentCreditsUsed + 1)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Rewrite error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
