import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createServiceClient } from "../supabase/service";

// Support GEMINI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or GOOGLE_API_KEY
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
const google = createGoogleGenerativeAI({
    apiKey: geminiApiKey || "placeholder-key",
});

const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function normalizeSeverity(val?: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!val) return 'low';
    const s = String(val).toLowerCase().trim();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'medium') return 'medium';
    if (s === 'low') return 'low';
    return 'medium';
}

export const processUxInsights = inngest.createFunction(
    { id: "process-ux-insights" },
    { event: "meetings.created" },
    async ({ event, step }) => {
        const { meetingId, transcript } = event.data;

        if (!transcript || transcript.trim().length === 0) {
            return { success: false, reason: "Empty transcript" };
        }

        const analysisText = await step.run("analyze-transcript-with-gemini", async () => {
            const systemPrompt = `You are an expert UX researcher and Product Manager. Analyze customer interview and meeting transcripts to extract actionable product insights.

Extract feedback into three distinct categories:
1. "friction_points": UX hurdles, confusion, user pain points, frustration, or workflow obstacles. Extract verbatim quotes as evidence.
2. "bugs": Software defects, errors, broken elements, unexpected behaviors, or technical glitches mentioned by users. Extract verbatim quotes.
3. "feature_requests": New features, capabilities, integrations, or improvements suggested by users, complete with their context/use case.

For each item, assign a strict severity or urgency rating:
- "critical": Blocker, prevents core workflow, crashes, major security/data issue, or dealbreaker.
- "high": Significant friction, persistent bug impacting work, or high-urgency feature request.
- "medium": Moderate friction, minor bug with workaround, or nice-to-have improvement.
- "low": Minor cosmetic issue, minor convenience request, or slight annoyance.

Return ONLY valid JSON matching this exact structure:
{
  "friction_points": [
    { "topic": "Short summary", "quote": "Verbatim user words", "severity": "critical|high|medium|low" }
  ],
  "bugs": [
    { "issue": "Short bug summary", "quote": "Verbatim user words describing bug", "severity": "critical|high|medium|low" }
  ],
  "feature_requests": [
    { "feature": "Feature name", "context": "Why they need it and their use case", "urgency": "critical|high|medium|low" }
  ]
}
Do not include any text outside the JSON.`;

            // Use Google Gemini (default: gemini-2.5-flash), with fallback to Anthropic if legacy key is present
            const model = geminiApiKey 
                ? google(geminiModel) 
                : anthropic("claude-haiku-4-5");

            const result = await generateText({
                model,
                system: systemPrompt,
                prompt: `Meeting Transcript:\n\n${transcript}`,
            });
            return result.text;
        });

        const analysis = await step.run("parse-json", async () => {
            const cleanText = analysisText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in model output: " + analysisText.substring(0, 100));
            return JSON.parse(jsonMatch[0]);
        });

        await step.run("save-to-supabase", async () => {
            const supabase = createServiceClient();
            const insightsToInsert: Array<{
                meeting_id: string;
                issue: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                status: 'open';
            }> = [];

            // 1. Friction Points
            if (Array.isArray(analysis.friction_points)) {
                for (const fp of analysis.friction_points) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[Friction] ${fp.topic || 'General'}: "${fp.quote || 'No quote'}"`,
                        severity: normalizeSeverity(fp.severity),
                        status: 'open',
                    });
                }
            }

            // 2. Bugs
            if (Array.isArray(analysis.bugs)) {
                for (const b of analysis.bugs) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[Bug] ${b.issue || 'Defect'}: "${b.quote || 'No quote'}"`,
                        severity: normalizeSeverity(b.severity || 'high'),
                        status: 'open',
                    });
                }
            }

            // 3. Feature Requests
            if (Array.isArray(analysis.feature_requests)) {
                for (const fr of analysis.feature_requests) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[Feature Request] ${fr.feature || 'Unknown'}: ${fr.context || 'No context'}`,
                        severity: normalizeSeverity(fr.urgency),
                        status: 'open',
                    });
                }
            }

            if (insightsToInsert.length > 0) {
                const { data, error } = await supabase.from('insights').insert(insightsToInsert).select();
                if (error) throw error;

                if (data) {
                    for (const ins of data) {
                        await inngest.send({
                            name: "insights.discovered",
                            data: { insightId: ins.id, issue: ins.issue, meetingId }
                        });
                    }
                }
            }
        });

        return { success: true };
    }
);
