import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processUxInsights } from "@/lib/inngest/ux-insights";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processUxInsights,
    ],
});

