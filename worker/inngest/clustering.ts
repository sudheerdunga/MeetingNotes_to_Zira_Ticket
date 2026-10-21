import { inngest } from "../../src/lib/inngest/client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createServiceClient } from "../../src/lib/supabase/service";
import { Insight } from "../../src/types";

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
const google = createGoogleGenerativeAI({
    apiKey: geminiApiKey || "placeholder-key",
});

const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const clusterInsight = inngest.createFunction(
    { id: "cluster-insight" },
    { event: "insights.cluster" },
    async ({ event, step }) => {
        const { insightId, issue, embedding, userId } = event.data;
        const supabase = createServiceClient();

        const similarInsights = await step.run("search-similar", async () => {
            const { data } = await supabase.rpc('match_insights', {
                query_embedding: embedding,
                match_threshold: 0.85,
                match_count: 5,
                p_user_id: userId
            });
            return (data || []).filter((i: Insight) => i.id !== insightId);
        });

        if (similarInsights.length === 0) return { status: "no matches" };

        const decision = await step.run("ai-cluster", async () => {
            const model = geminiApiKey 
                ? google(geminiModel) 
                : anthropic("claude-haiku-4-5");

            const result = await generateText({
                model,
                system: "You are an AI product manager assistant. Analyze the given user feedback issues to determine if they share a common root cause. Return ONLY valid JSON in format: {\"shared\": boolean, \"title\": string, \"root_cause\": string, \"impact\": string}",
                prompt: `Determine if these insights share a root cause: ${issue} vs ${similarInsights.map((i: Insight) => i.issue).join(', ')}`,
            });
            const cleanText = result.text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { shared: false };
        });

        if (!decision.shared) return { status: "not shared" };

        await step.run("link-opportunity", async () => {
            const { data: existing } = await supabase
                .from('insights')
                .select('opportunity_id')
                .in('id', similarInsights.map((i: Insight) => i.id))
                .not('opportunity_id', 'is', null)
                .limit(1);

            let oppId = existing?.[0]?.opportunity_id;

            if (!oppId) {
                const { data: newOpp } = await supabase.from('opportunities').insert({
                    user_id: userId,
                    title: decision.title,
                    root_cause: decision.root_cause,
                    sentiment_impact: decision.impact
                }).select().single();
                oppId = newOpp.id;
            }

            await supabase.from('insights').update({ opportunity_id: oppId }).in('id', [insightId, ...similarInsights.map((i: Insight) => i.id)]);
        });

        return { status: "clustered" };
    }
);
