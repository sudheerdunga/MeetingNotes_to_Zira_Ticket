
import { inngest } from "./client";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createServiceClient } from "../supabase/service";

const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const processUxInsights = inngest.createFunction(
    { id: "process-ux-insights" },
    { event: "meetings.created" },
    async ({ event, step }) => {
        const { meetingId, transcript } = event.data;

        if (!transcript || transcript.trim().length === 0) {
            return { success: false, reason: "Empty transcript" };
        }

        const analysisText = await step.run("analyze-transcript-with-claude", async () => {
            const systemPrompt = `Analyze UX insights from this transcript. Return ONLY valid JSON matching this exact structure:
{
  "friction_points": [
    { "topic": "Short summary", "quote": "User exact words", "severity": "low|medium|high" }
  ],
  "feature_requests": [
    { "feature": "Feature name", "context": "Why they need it", "urgency": "low|medium|high" }
  ]
}
Do not include any text outside the JSON.`;
            const result = await generateText({
                model: anthropic("claude-haiku-4-5"),
                system: systemPrompt,
                prompt: `Transcript:\n\n${transcript}`,
            });
            return result.text;
        });

        const analysis = await step.run("parse-json", async () => {
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found");
            return JSON.parse(jsonMatch[0]);
        });

        await step.run("save-to-supabase", async () => {
            const supabase = createServiceClient();
            const insightsToInsert = [];

            if (analysis.friction_points) {
                for (const fp of analysis.friction_points) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[Friction] ${fp.topic || 'General'}: "${fp.quote || 'No quote'}"`,
                        severity: (fp.severity || 'low').toLowerCase(),
                        status: 'open',
                    });
                }
            }

            if (analysis.feature_requests) {
                for (const fr of analysis.feature_requests) {
                    insightsToInsert.push({
                        meeting_id: meetingId,
                        issue: `[Feature Request] ${fr.feature || 'Unknown'}: ${fr.context || 'No context'}`,
                        severity: (fr.urgency || 'low').toLowerCase(),
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
