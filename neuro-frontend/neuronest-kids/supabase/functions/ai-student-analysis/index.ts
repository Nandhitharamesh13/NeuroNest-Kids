import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameStats {
  game: string;
  totalPlays: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  mostMissedAreas: string[];
  streaks: {
    best: number;
    current: number;
  };
}

interface StudentData {
  childName: string;
  age: number;
  gameStats: GameStats[];
  totalPlayTime: number;
  overallAccuracy: number;
  strongAreas: string[];
  weakAreas: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentData, analysisType } = await req.json() as { 
      studentData: StudentData; 
      analysisType: 'comprehensive' | 'quick' | 'recommendations' | 'progress' 
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educational psychologist specializing in autism-friendly learning for children ages 3-10. 
You analyze student learning data and provide insights specifically designed for parents of autistic children.

Your analysis should be:
- Warm, encouraging, and strength-based
- Practical with specific, actionable suggestions
- Sensitive to sensory and learning differences
- Written in simple, parent-friendly language
- Focused on celebrating progress while identifying growth opportunities

IMPORTANT: Format your response as valid JSON with these fields:
{
  "summary": "Brief 2-3 sentence overview of the child's learning journey",
  "strengths": ["list of 3-5 specific strengths observed"],
  "areasForGrowth": ["list of 2-3 areas that could use more practice"],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "priority": "high" | "medium" | "low",
      "gameToPlay": "suggested game name or null"
    }
  ],
  "encouragement": "A warm, personalized message for the parent",
  "nextMilestone": "The next learning milestone the child is approaching",
  "learningStyle": "Observed learning style preferences",
  "sensoryNotes": "Any sensory considerations noted from the data"
}`;

    let userPrompt = "";
    
    switch (analysisType) {
      case 'comprehensive':
        userPrompt = `Analyze this student's complete learning data and provide a comprehensive assessment:

Student: ${studentData.childName}, Age: ${studentData.age}
Total Play Time: ${studentData.totalPlayTime} minutes
Overall Accuracy: ${studentData.overallAccuracy}%

Game Performance:
${studentData.gameStats.map(g => `
- ${g.game}: 
  * Plays: ${g.totalPlays}
  * Accuracy: ${g.accuracy}%
  * Correct: ${g.correctAnswers}, Incorrect: ${g.incorrectAnswers}
  * Best Streak: ${g.streaks.best}
  * Problem Areas: ${g.mostMissedAreas.join(', ') || 'None noted'}
`).join('')}

Strong Areas: ${studentData.strongAreas.join(', ') || 'Still building'}
Areas Needing Support: ${studentData.weakAreas.join(', ') || 'Still exploring'}

Provide a detailed, strength-based analysis with specific recommendations for this child's unique learning journey.`;
        break;
        
      case 'quick':
        userPrompt = `Provide a quick snapshot analysis for:

Student: ${studentData.childName}, Age: ${studentData.age}
Recent Accuracy: ${studentData.overallAccuracy}%
Games Played: ${studentData.gameStats.map(g => g.game).join(', ')}
Best Performance: ${studentData.strongAreas.join(', ') || 'Exploring all areas'}

Give a brief, encouraging summary with 1-2 quick tips for continued growth.`;
        break;
        
      case 'recommendations':
        userPrompt = `Based on this learning data, provide personalized game recommendations:

Student: ${studentData.childName}, Age: ${studentData.age}
Current Strengths: ${studentData.strongAreas.join(', ')}
Areas to Build: ${studentData.weakAreas.join(', ')}

Game Performance Summary:
${studentData.gameStats.map(g => `- ${g.game}: ${g.accuracy}% accuracy, ${g.totalPlays} plays`).join('\n')}

Recommend which games to focus on next and why, considering autism-friendly learning progressions.`;
        break;
        
      case 'progress':
        userPrompt = `Analyze learning progress for:

Student: ${studentData.childName}, Age: ${studentData.age}
Total Sessions: ${studentData.gameStats.reduce((sum, g) => sum + g.totalPlays, 0)}
Overall Accuracy: ${studentData.overallAccuracy}%

Streak Data:
${studentData.gameStats.map(g => `- ${g.game}: Best streak of ${g.streaks.best}`).join('\n')}

Highlight progress made and provide motivating insights for continued engagement.`;
        break;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI analysis");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response from AI
    let analysis;
    try {
      // Extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, return structured error with raw content
      analysis = {
        summary: content,
        strengths: [],
        areasForGrowth: [],
        recommendations: [],
        encouragement: "Keep up the great work!",
        nextMilestone: "Continue exploring games",
        learningStyle: "Still being determined",
        sensoryNotes: "No specific notes",
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
