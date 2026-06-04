import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GameSessionData {
  gameType: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  responseTimeMs?: number;
  consecutiveWrong?: number;
  currentStreak?: number;
}

interface ChildBehaviorData {
  preferred_pace: string;
  attention_span_minutes: number;
  prefers_sounds: boolean;
  prefers_animations: boolean;
  average_accuracy: number;
  frustration_threshold: number;
  current_difficulty_level: number;
  strong_categories: string[];
  challenging_categories: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, childId, gameData, behaviorProfile, currentQuestion } =
      await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    const AI_API_URL = Deno.env.get("AI_API_URL") || "https://api.openai.com/v1/chat/completions";

    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "get_encouragement":
        // Generate personalized encouragement based on child's current state
        systemPrompt = `You are a friendly, supportive AI helper for children with autism aged 3-15. 
Your role is to provide warm, calming encouragement during educational games.

CRITICAL RULES:
- Use VERY simple language (2-3 word sentences when possible)
- Be extremely positive and gentle
- Never use complex words
- Focus on effort, not results
- Use emojis sparingly but warmly
- Keep responses under 15 words
- Avoid overwhelming sensory language`;

        userPrompt = `The child just got ${
          gameData.consecutiveWrong || 0
        } answers wrong in a row in the ${
          gameData.gameType
        } game.\nTheir overall accuracy is ${gameData.correctAnswers}/${
          gameData.totalQuestions
        }.\nGenerate a SHORT, calming, encouraging message (max 12 words).`;
        break;

      case "adjust_difficulty":
        // Analyze performance and recommend difficulty adjustments
        systemPrompt = `You are an autism-specialized educational AI that adapts game difficulty based on child performance patterns.

Analyze the data and return a JSON object with:
- newDifficulty: number 1-5
- reasoning: string (brief explanation)
- recommendedPace: "slower" | "same" | "faster"
- additionalSupport: array of suggestions`;

        userPrompt = `Analyze this child's recent performance:
- Current difficulty level: ${behaviorProfile?.current_difficulty_level || 1}
- Average accuracy: ${behaviorProfile?.average_accuracy || 0}%
- Recent game: ${gameData.correctAnswers}/${gameData.totalQuestions} correct
- Response time trend: ${gameData.responseTimeMs ? "Fast" : "Normal"}
- Strong areas: ${(behaviorProfile?.strong_categories || []).join(", ") ||
          "None identified"}
- Challenging areas: ${(behaviorProfile?.challenging_categories || []).join(
            ", ",
          ) || "None identified"}
- Frustration threshold: ${behaviorProfile?.frustration_threshold || 3} wrong answers

Provide difficulty adjustment recommendation as JSON.`;
        break;

      case "generate_hint":
        // Generate autism-friendly hints for current question
        systemPrompt = `You are a gentle teaching assistant for children with autism.
Generate a helpful hint that:
- Uses visual/concrete language
- Breaks down the task simply
- Doesn't give away the answer
- Uses familiar comparisons
- Is very brief (under 10 words)`;

        userPrompt = `The child needs a hint for this ${gameData.gameType} game.
Current question: ${currentQuestion?.question || "Find the matching item"}
Correct answer: ${currentQuestion?.answer || "The correct option"}
Generate ONE simple, autism-friendly hint.`;
        break;

      case "session_summary":
        // Generate end-of-session feedback for parents
        systemPrompt = `You are an educational specialist analyzing a child's learning session.
Provide constructive, strength-based feedback that:
- Highlights what went well
- Identifies patterns gently
- Suggests next steps
- Uses encouraging language
- Is suitable for parents to read

Return a JSON object with:
- summary: string (2-3 sentences)
- strengths: array of strings
- areasToExplore: array of strings
- recommendedNextActivity: string
- parentTip: string`;

        userPrompt = `Summarize this learning session:
- Games played: ${gameData.gameType}
- Total questions: ${gameData.totalQuestions}
- Correct answers: ${gameData.correctAnswers}
- Score: ${gameData.score}
- Best streak: ${gameData.currentStreak || 0}
- Child's preferred pace: ${behaviorProfile?.preferred_pace || "normal"}
- Known strengths: ${(behaviorProfile?.strong_categories || []).join(", ") ||
          "Still learning"}
- Areas for growth: ${(behaviorProfile?.challenging_categories || []).join(
            ", ",
          ) || "Exploring"}

Generate a parent-friendly session summary as JSON.`;
        break;

      case "real_time_support":
        // Provide real-time adaptive support during gameplay
        systemPrompt = `You are an autism-specialized gameplay assistant.
Based on the child's current state, provide real-time support recommendations.

Return a JSON object with:
- shouldShowHint: boolean
- shouldSlowPace: boolean
- shouldTakeBreak: boolean
- encouragementMessage: string (if needed, max 8 words)
- uiAdjustments: object with suggestions`;

        userPrompt = `Current gameplay state:
- Game: ${gameData.gameType}
- Consecutive wrong: ${gameData.consecutiveWrong || 0}
- Time on current question: ${gameData.responseTimeMs || 0}ms
- Session duration: ${gameData.sessionDuration || 0} minutes
- Child's attention span: ${behaviorProfile?.attention_span_minutes || 10} minutes
- Frustration threshold: ${behaviorProfile?.frustration_threshold || 3}
- Prefers animations: ${behaviorProfile?.prefers_animations ?? true}
- Current difficulty: ${behaviorProfile?.current_difficulty_level || 1}

Provide real-time support recommendations as JSON.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON if expected
    if (["adjust_difficulty", "session_summary", "real_time_support"].includes(
      action,
    )) {
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/) ||
          [null, result];
        result = JSON.parse(jsonMatch[1] || result);
      } catch {
        // Keep as string if parsing fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, result, action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Adaptive AI Helper error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
