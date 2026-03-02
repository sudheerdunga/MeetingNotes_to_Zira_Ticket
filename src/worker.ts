import { serve } from "inngest/node";
import { inngest } from "./lib/inngest/client";
import { processUxInsights, clusterInsight, generateInsightEmbedding } from "./lib/inngest/functions";
import http from "http";

// Serve Inngest functions using the Node.js adapter
const handler = serve({
    client: inngest,
    functions: [processUxInsights, clusterInsight, generateInsightEmbedding],
});

const PORT = process.env.PORT || 3000;

// Create a simple HTTP server to satisfy Render's requirement if it's a web service,
// or just to provide a health check if it's a worker.
const server = http.createServer((req, res) => {
    // Basic health check
    if (req.url === "/health" || req.url === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", service: "kodasync-worker" }));
        return;
    }

    // Pass everything else to Inngest
    handler(req, res);
});

server.listen(PORT, () => {
    console.log(`[Worker] Inngest worker listening on port ${PORT}`);
});
