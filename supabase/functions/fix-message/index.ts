import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
const DAILY_CREDIT_LIMIT = 30;

function getCreditCost(messageLength: number): number {
  if (messageLength <= 100) return 1;
  if (messageLength <= 200) return 2;
  return 3;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // 2. Parse & validate body
    const { message, tone } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (message.length > 300) {
      return new Response(
        JSON.stringify({ error: "Message must be 300 characters or less." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!tone || !TONE_PROMPTS[tone]) {
      return new Response(
        JSON.stringify({ error: "Invalid tone." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Rate limiting — 10 req/min
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count: recentCount } = await supabaseClient
      .from("requests_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneMinuteAgo);

    if ((recentCount ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for credit operations
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 4. Fetch user credits
    let { data: credits } = await adminClient
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!credits) {
      await adminClient.from("user_credits").insert({ user_id: userId });
      credits = {
        user_id: userId,
        daily_credits_used: 0,
        daily_reset_timestamp: new Date().toISOString(),
        monthly_bonus_used: 0,
        monthly_reset_timestamp: new Date().toISOString(),
        is_pro: false,
      };
    }

    const now = new Date();

    // 5. Daily reset check
    const dailyReset = new Date(credits.daily_reset_timestamp);
    const hoursSinceReset = (now.getTime() - dailyReset.getTime()) / (1000 * 60 * 60);
    if (hoursSinceReset >= 24) {
      credits.daily_credits_used = 0;
      credits.daily_reset_timestamp = now.toISOString();
      await adminClient.from("user_credits")
        .update({ daily_credits_used: 0, daily_reset_timestamp: now.toISOString() })
        .eq("user_id", userId);
    }

    const cost = getCreditCost(message.length);
    const isProTone = !FREE_TONES.includes(tone);

    // 6. Credit checks (skip for Pro users)
    if (!credits.is_pro) {
      if (credits.daily_credits_used + cost > DAILY_CREDIT_LIMIT) {
        return new Response(
          JSON.stringify({ 
            error: "Daily credits exhausted. Upgrade to Pro.",
            requiresUpgrade: true,
            type: "daily_limit"
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 7. Deduct credits BEFORE calling AI
    if (!credits.is_pro) {
      await adminClient.from("user_credits")
        .update({ daily_credits_used: credits.daily_credits_used + cost })
        .eq("user_id", userId);
    }

    // 8. Log request
    await adminClient.from("requests_log").insert({
      user_id: userId,
      tone,
      input_length: message.length,
    });

    // 9. Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Refund credits
      if (!credits.is_pro) {
        await adminClient.from("user_credits")
          .update({ daily_credits_used: credits.daily_credits_used })
          .eq("user_id", userId);
      }
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = TONE_PROMPTS[tone];
    // Free tones: ask for 3 distinct variations. Pro tones: 1 result (will be blurred for free users).
    const wantVariations = !isProTone;
    const userPrompt = wantVariations
      ? `${message}\n\nReturn EXACTLY 3 distinct rewrites of the message above, each on its own line, separated by the literal delimiter "|||". No numbering, no labels, no extra text — just three rewrites separated by |||.`
      : message;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      // Refund credits on AI failure
      if (!credits.is_pro) {
        await adminClient.from("user_credits")
          .update({ daily_credits_used: credits.daily_credits_used })
          .eq("user_id", userId);
      }

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
    const fixedMessage = aiData.choices?.[0]?.message?.content?.trim();

    if (!fixedMessage) {
      // Refund
      if (!credits.is_pro) {
        await adminClient.from("user_credits")
          .update({ daily_credits_used: credits.daily_credits_used })
          .eq("user_id", userId);
      }
      return new Response(
        JSON.stringify({ error: "No response from AI." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 10. Return result
    const newDailyUsed = credits.is_pro ? 0 : credits.daily_credits_used + cost;

    return new Response(
      JSON.stringify({
        fixedMessage,
        creditCost: cost,
        dailyCreditsUsed: newDailyUsed,
        dailyCreditsRemaining: credits.is_pro ? "unlimited" : Math.max(0, DAILY_CREDIT_LIMIT - newDailyUsed),
        isPro: credits.is_pro,
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
