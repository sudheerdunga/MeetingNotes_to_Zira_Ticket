
import { inngest } from "./client";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createServiceClient } from "../supabase/service";

// Initialize Anthropic provider explicitly
const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const processUxInsights = inngest.createFunction(
    { id: "process-ux-insights" },
    { event: "meetings.created" },
    async ({ event, step }) => {
        const { meetingId, transcript } = event.data;
        console.log(`[Inngest] Received meetings.created for meetingId: ${meetingId}`);

        if (!transcript || transcript.trim().length === 0) {
            console.warn(`No transcript provided for meeting ${meetingId}. Skipping AI analysis.`);
            return { success: false, reason: "Empty transcript" };
        }

        const analysisText = await step.run("analyze-transcript-with-claude", async () => {
            const systemPrompt = `### ROLE
You are a Senior UX Research Analyst specializing in SaaS product discovery. Your goal is to extract high-signal behavioral insights from the provided meeting transcript.

### OBJECTIVES
1. Identify "Friction Points": Where is the user confused, annoyed, or stuck?
2. Extract "Aha! Moments": When does the user express excitement or clarity?
3. Detect "Feature Gaps": What functionality does the user assume exists but doesn't?
4. Document "Workarounds": How is the user currently solving their problem (even if inefficiently)?

### OUTPUT FORMAT (JSON ONLY)
Return the analysis in a structured JSON format with the following keys:

- "sentiment_score": (Scale 1-10, 1 being frustrated, 10 being delighted)
- "top_insights": [List of 3-5 high-level takeaway sentences]
- "friction_points": [
    {"topic": string, "timestamp": string, "severity": "High/Med/Low", "quote": string}
  ]
- "feature_requests": [
    {"feature": string, "context": string, "urgency": "High/Med/Low"}
  ]
- "thematic_tags": [List of 5 keywords for cross-meeting clustering]

### CONSTRAINTS
- Ignore "Small Talk" (weather, greetings, scheduling).
- Prioritize "Why" over "What" (e.g., instead of "User likes the dashboard," use "User likes the dashboard because it saves them 2 hours of manual reporting").
- If the user contradicts themselves, flag it as a "Cognitive Dissonance" insight.

Output: Structured JSON.`;

            console.log("Starting Claude analysis...");
            console.log("ANTHROPIC_API_KEY present:", !!process.env.ANTHROPIC_API_KEY);

            try {
                const result = await generateText({
                    model: anthropic("claude-3-7-sonnet-20250219"),
                    system: systemPrompt,
                    prompt: `Analyze the following meeting transcript:\n\n${transcript}`,
                });
                console.log("Claude analysis successful");
                return result.text;
            } catch (error: any) {
                console.error("Anthropic API Error Details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
                throw error;
            }
        });

        const analysis = await step.run("parse-analysis-json", async () => {
            console.log("Parsing analysis JSON...");
            // Extract JSON from the output (in case Claude adds prose)
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error("No JSON found in Claude's output:", analysisText);
                throw new Error("No JSON found in Claude's output");
            }
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log("Successfully parsed analysis JSON");
                return parsed;
            } catch (e) {
                console.error("Failed to parse JSON from Claude output:", jsonMatch[0]);
                throw e;
            }
        });

        await step.run("save-insights-to-supabase", async () => {
            console.log("Saving insights to Supabase...");
            const supabase = createServiceClient();

            const insightsToInsert = [];

            // Map friction points to insights table
            if (analysis.friction_points) {
                for (const fp of analysis.friction_points) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[Friction] ${fp.topic}: "${fp.quote}" (${fp.timestamp})`,
                        severity: fp.severity.toLowerCase() === 'med' ? 'medium' : fp.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
                        status: 'open',
                    });
                }
            }

            // Map feature requests to insights table
            if (analysis.feature_requests) {
                for (const fr of analysis.feature_requests) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[Feature Request] ${fr.feature}: ${fr.context}`,
                        severity: fr.urgency.toLowerCase() === 'med' ? 'medium' : fr.urgency.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
                        status: 'open',
                    });
                }
            }

            // Handle top insights as general insights if they are worth it
            if (analysis.top_insights) {
                for (const insight of analysis.top_insights) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[General Insight] ${insight}`,
                        severity: 'low',
                        status: 'resolved', // Marking as resolved as it's just an observation
                    });
                }
            }

            if (insightsToInsert.length > 0) {
                const { error } = await supabase.from('insights').insert(insightsToInsert);
                if (error) {
                    console.error("Error inserting insights:", error);
                    throw error;
                }
                console.log(`Successfully inserted ${insightsToInsert.length} insights`);
            } else {
                console.log("No insights to insert");
            }

            return { insertedCount: insightsToInsert.length };
        });

        const frictionPointsCount = (analysis.friction_points || []).length;
        const featureRequestsCount = (analysis.feature_requests || []).length;

        console.log(`[Inngest] Function complete for meetingId: ${meetingId}. Total insights: ${frictionPointsCount + featureRequestsCount}`);
        return { success: true, insightCount: frictionPointsCount + featureRequestsCount };
    }
);
