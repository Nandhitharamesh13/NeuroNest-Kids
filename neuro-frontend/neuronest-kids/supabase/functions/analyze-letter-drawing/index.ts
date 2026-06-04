import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, targetLetter } = await req.json();

    if (!imageBase64 || !targetLetter) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64 or targetLetter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert handwriting analysis AI designed to help young children learn to write letters. 
Your task is to analyze a child's hand-drawn letter and determine if it matches the target letter.

Be encouraging and supportive while being accurate. Children's handwriting is not perfect, so:
- Accept reasonable attempts that show the basic shape of the letter
- Look for key features (straight lines, curves, angles) that define the letter
- Be forgiving of wobbly lines, uneven proportions, and imperfect connections
- If the drawing shows a genuine attempt at the letter (even if imperfect), consider it correct
- Only mark as incorrect if the drawing is clearly a different letter, random scribbles, or completely unrecognizable

Respond ONLY with valid JSON in this exact format:
{
  "isCorrect": true/false,
  "confidence": 0-100,
  "feedback": "Short encouraging message for the child",
  "recognizedLetter": "The letter you think this is, or 'unclear' if unrecognizable"
}`;

    const userPrompt = `The child was asked to draw the letter "${targetLetter}" (uppercase).
Please analyze the attached image and determine if it's a reasonable attempt at drawing "${targetLetter}".
Remember to be encouraging - this is for a young child learning to write!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1]?.trim() || content.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback analysis
      analysis = {
        isCorrect: false,
        confidence: 50,
        feedback: "Keep trying! Make sure to trace the whole letter.",
        recognizedLetter: "unclear",
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-letter-drawing:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        // Return a fallback so game can still work
        analysis: {
          isCorrect: false,
          confidence: 0,
          feedback: "Let's try again!",
          recognizedLetter: "unclear",
        }
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
