
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processUxInsights } from "@/lib/inngest/ux-insights";
import { sendWaitlistEmails } from "@/lib/inngest/emails";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processUxInsights,
        sendWaitlistEmails,
    ],
});
