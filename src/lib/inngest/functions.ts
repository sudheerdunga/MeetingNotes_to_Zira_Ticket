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
            } catch (error: unknown) {
                console.error("Anthropic API Error Details:", error);
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

            // Map friction points
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

            // Map feature requests
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

            if (insightsToInsert.length > 0) {
                const { data, error } = await supabase.from('insights').insert(insightsToInsert).select();
                if (error) {
                    console.error("Error inserting insights:", error);
                    throw error;
                }

                if (data) {
                    for (const ins of data) {
                        await inngest.send({
                            name: "insights.discovered",
                            data: {
                                insightId: ins.id,
                                issue: ins.issue,
                                meetingId: meetingId
                            }
                        });
                    }
                }

                console.log(`Successfully inserted ${insightsToInsert.length} insights and triggered embedding generation`);
            }

            return { insertedCount: insightsToInsert.length };
        });

        const frictionPointsCount = (analysis.friction_points || []).length;
        const featureRequestsCount = (analysis.feature_requests || []).length;

        console.log(`[Inngest] Function complete for meetingId: ${meetingId}. Total insights: ${frictionPointsCount + featureRequestsCount}`);
        return { success: true, insightCount: frictionPointsCount + featureRequestsCount };
    }
);

export const generateInsightEmbedding = inngest.createFunction(
    { id: "generate-insight-embedding" },
    { event: "insights.discovered" },
    async ({ event, step }) => {
        const { insightId, issue, meetingId } = event.data;
        const supabase = createServiceClient();

        // 1. Import generateEmbedding dynamically here to keep it out of shared bundle if possible
        const { generateEmbedding } = await import("../ai/embeddings");

        const embedding = await step.run("calculate-embedding", async () => {
            return await generateEmbedding(issue);
        });

        await step.run("update-insight-with-embedding", async () => {
            const { error } = await supabase
                .from('insights')
                .update({ embedding })
                .eq('id', insightId);

            if (error) throw error;
        });

        // 2. Fetch user_id for clustering
        const meetingData = await step.run("fetch-meeting-user", async () => {
            const { data, error } = await supabase
                .from('meetings')
                .select('user_id')
                .eq('id', meetingId)
                .single();

            if (error) throw error;
            return data;
        });

        // 3. Trigger clustering
        await inngest.send({
            name: "insights.cluster",
            data: {
                insightId,
                issue,
                embedding,
                userId: meetingData.user_id
            }
        });

        return { success: true };
    }
);

export const clusterInsight = inngest.createFunction(
    { id: "cluster-insight" },
    { event: "insights.cluster" },
    async ({ event, step }) => {
        const { insightId, issue, embedding, userId } = event.data;
        const supabase = createServiceClient();

        // 1. Search for similar insights (similarity > 0.85)
        const similarInsights = await step.run("find-similar-insights", async () => {
            const { data, error } = await supabase.rpc('match_insights', {
                query_embedding: embedding,
                match_threshold: 0.85,
                match_count: 5,
                p_user_id: userId
            });

            if (error) throw error;
            // Filter out the current insight
            return (data || []).filter((i: any) => i.id !== insightId);
        });

        if (similarInsights.length === 0) {
            console.log(`No similar insights found for ${insightId}`);
            return { clustered: false, reason: "No matches" };
        }

        // 2. Use Claude 3.7 to determine if they share a Root Cause
        const clusteringDecision = await step.run("determine-root-cause", async () => {
            const issuesList = similarInsights.map((i: any) => `- ${i.issue}`).join('\n');
            const prompt = `You are a Senior Product Manager. I have a new user insight and a list of existing similar insights.
            Determine if they share the exact same ROOT CAUSE (the underlying problem, not just same topic).

            NEW INSIGHT:
            "${issue}"

            EXISTING SIMILAR INSIGHTS:
            ${issuesList}

            If they share a root cause, provide a concise but impactful "Opportunity Title" (e.g., "Onboarding Friction in Billing") and a one-sentence "Root Cause Analysis".
            If they don't share a clear root cause, say "DIFFERENT".

            Output JSON: { "shared": boolean, "title": string, "root_cause": string, "impact": string }
            `;

            const result = await generateText({
                model: anthropic("claude-3-7-sonnet-20250219"),
                prompt: prompt,
            });

            // Extract JSON
            const jsonMatch = result.text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return { shared: false };
            return JSON.parse(jsonMatch[0]);
        });

        if (!clusteringDecision.shared) {
            return { clustered: false, reason: "Claude: Different root causes" };
        }

        // 3. Group them into an Opportunity
        await step.run("update-opportunity-in-db", async () => {
            // Check if any of the similar insights already belong to an opportunity
            const { data: existingRelations } = await supabase
                .from('insights')
                .select('opportunity_id')
                .in('id', similarInsights.map((i: any) => i.id))
                .not('opportunity_id', 'is', null)
                .limit(1);

            let opportunityId = existingRelations?.[0]?.opportunity_id;

            if (!opportunityId) {
                // Create new opportunity
                const { data: newOpp, error: oppError } = await supabase
                    .from('opportunities')
                    .insert({
                        user_id: userId,
                        title: clusteringDecision.title,
                        root_cause: clusteringDecision.root_cause,
                        sentiment_impact: clusteringDecision.impact,
                        status: 'active'
                    })
                    .select()
                    .single();

                if (oppError) throw oppError;
                opportunityId = newOpp.id;
            }

            // Link current insight and all similar insights to this opportunity
            const allInsightIds = [insightId, ...similarInsights.map((i: any) => i.id)];
            const { error: linkError } = await supabase
                .from('insights')
                .update({ opportunity_id: opportunityId })
                .in('id', allInsightIds);

            if (linkError) throw linkError;

            return { opportunityId };
        });

        return { clustered: true };
    }
);
