
import { serve } from "inngest/node";
import { inngest } from "./lib/inngest/client";
import { processUxInsights } from "./lib/inngest/ux-insights";
import { generateInsightEmbedding } from "./lib/inngest/embeddings";
import { clusterInsight } from "./lib/inngest/clustering";
import http from "http";

const handler = serve({
    client: inngest,
    functions: [processUxInsights, generateInsightEmbedding, clusterInsight],
});

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
        return;
    }
    handler(req, res);
});

server.listen(PORT, () => {
    console.log(`[Worker] Listening on port ${PORT}`);
});
