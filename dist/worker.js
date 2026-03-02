"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("inngest/node");
const client_1 = require("./lib/inngest/client");
const functions_1 = require("./lib/inngest/functions");
const http_1 = __importDefault(require("http"));
// Serve Inngest functions using the Node.js adapter
const handler = (0, node_1.serve)({
    client: client_1.inngest,
    functions: [functions_1.processUxInsights, functions_1.clusterInsight],
});
const PORT = process.env.PORT || 3000;
// Create a simple HTTP server to satisfy Render's requirement if it's a web service,
// or just to provide a health check if it's a worker.
const server = http_1.default.createServer((req, res) => {
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
