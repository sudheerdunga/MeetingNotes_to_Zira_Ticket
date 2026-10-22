// Test script to verify Gemini 2.5 Flash AI Insight Extraction
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { readFileSync, existsSync } from "fs";

// Load environment variables from .env if present
if (existsSync(".env")) {
    const envFile = readFileSync(".env", "utf8");
    envFile.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const val = match[2].trim().replace(/^['"]|['"]$/g, "");
            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    });
}

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

console.log("🔍 Checking Gemini Configuration...");
console.log(`   Model: ${geminiModel}`);
console.log(`   API Key: ${geminiApiKey ? "✅ Found (" + geminiApiKey.slice(0, 6) + "..." + geminiApiKey.slice(-4) + ")" : "❌ Not found in environment"}`);
console.log("");

if (!geminiApiKey) {
    console.error("❌ Error: No Gemini API Key found!");
    console.log("💡 Please provide your key in .env or run:");
    console.log("   GEMINI_API_KEY=your_key_here node test-gemini-insights.mjs\n");
    process.exit(1);
}

const google = createGoogleGenerativeAI({
    apiKey: geminiApiKey,
});

const sampleTranscript = `
Interviewer: Thanks for joining today, Sarah. How has your experience been with our project dashboard so far?
Sarah: Thanks for having me! Honestly, there are parts I love, but yesterday I hit a massive roadblock. Every time I tried to export my monthly report to CSV, the entire page froze and threw a 500 network error. "The export button completely broke my workflow and crashed the tab twice." That was a critical blocker for our leadership meeting.
Interviewer: Oh no, sorry about that! Did you find any workarounds?
Sarah: I had to manually copy-paste rows into Excel. Also, I noticed that changing user permissions is super confusing. "I spent twenty minutes looking for the team role dropdown because it's hidden under billing settings." It feels completely misplaced.
Interviewer: That's really helpful feedback. What's one feature you wish we had?
Sarah: "If we had direct Slack notifications whenever a ticket status moves to Blocked, that would save my team hours of manual checking every single day." Right now we have to keep refreshing Jira.
Interviewer: Understood, thank you so much!
`;

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

async function testGeminiExtraction() {
    console.log("🚀 Sending sample transcript to Gemini for analysis...");
    const startTime = Date.now();

    try {
        const result = await generateText({
            model: google(geminiModel),
            system: systemPrompt,
            prompt: `Meeting Transcript:\n\n${sampleTranscript}`,
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`⚡ Received response in ${duration}s!\n`);

        const cleanText = result.text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("Could not parse JSON from model output:\n" + result.text);
        }

        const data = JSON.parse(jsonMatch[0]);

        console.log("📋 Extracted Insights Summary:");
        console.log("=========================================");

        console.log(`\n🛑 Bugs Detected (${data.bugs?.length || 0}):`);
        (data.bugs || []).forEach((b, i) => {
            console.log(`  ${i + 1}. [${b.severity?.toUpperCase()}] ${b.issue}`);
            console.log(`     💬 Quote: "${b.quote}"`);
        });

        console.log(`\n⚠️  Friction Points Detected (${data.friction_points?.length || 0}):`);
        (data.friction_points || []).forEach((f, i) => {
            console.log(`  ${i + 1}. [${f.severity?.toUpperCase()}] ${f.topic}`);
            console.log(`     💬 Quote: "${f.quote}"`);
        });

        console.log(`\n💡 Feature Requests (${data.feature_requests?.length || 0}):`);
        (data.feature_requests || []).forEach((fr, i) => {
            console.log(`  ${i + 1}. [${fr.urgency?.toUpperCase()}] ${fr.feature}`);
            console.log(`     📝 Context: ${fr.context}`);
        });

        console.log("\n=========================================");
        console.log("🎉 SUCCESS: Gemini 2.5 Flash is working perfectly with KodaSync!");
    } catch (err) {
        console.error("\n❌ Gemini Analysis Failed:", err.message);
        if (err.message.includes("API key")) {
            console.error("👉 Please ensure your Gemini API key is valid and has Gemini API access enabled in Google AI Studio.");
        }
    }
}

testGeminiExtraction();
