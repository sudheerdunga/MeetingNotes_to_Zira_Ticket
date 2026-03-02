
import { inngest } from "./client";
import { createServiceClient } from "../supabase/service";

export const generateInsightEmbedding = inngest.createFunction(
    { id: "generate-insight-embedding" },
    { event: "insights.discovered" },
    async ({ event, step }) => {
        const { insightId, issue, meetingId } = event.data;
        const supabase = createServiceClient();

        // Lazy load the heavy AI library
        const { generateEmbedding } = await import("../ai/embeddings");

        const embedding = await step.run("calculate-embedding", async () => {
            return await generateEmbedding(issue);
        });

        await step.run("update-db", async () => {
            await supabase.from('insights').update({ embedding }).eq('id', insightId);
        });

        const meetingData = await step.run("fetch-user", async () => {
            const { data } = await supabase.from('meetings').select('user_id').eq('id', meetingId).single();
            return data;
        });

        await inngest.send({
            name: "insights.cluster",
            data: { insightId, issue, embedding, userId: meetingData.user_id }
        });

        return { success: true };
    }
);
