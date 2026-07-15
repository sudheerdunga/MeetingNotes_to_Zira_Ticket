
'use server'

import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { doc, p, strong, text, a, blockQuote } from "@atlaskit/adf-utils/builders";
import { revalidatePath } from "next/cache";
import { Insight, Meeting } from "@/types";


async function getJiraContext(accessToken: string) {
    // 1. Get Accessible Resources (Cloud ID)
    const resourcesResponse = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    });

    if (!resourcesResponse.ok) {
        throw new Error("Failed to fetch Jira accessible resources");
    }

    const resources = await resourcesResponse.json();
    if (!resources || resources.length === 0) {
        throw new Error("No Jira resources found for this user");
    }

    const cloudId = resources[0].id; // Use the first available site

    // 2. Get Projects to find a valid one
    const projectsResponse = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    });

    if (!projectsResponse.ok) {
        throw new Error("Failed to fetch Jira projects");
    }

    const projectsData = await projectsResponse.json();
    if (!projectsData.values || projectsData.values.length === 0) {
        throw new Error("No Jira projects found in this site");
    }

    const project = projectsData.values[0]; // Use the first project

    return { cloudId, projectKey: project.key, projectId: project.id };
}

export async function pushToJira(insightId: string) {
    try {
        const session = await auth();
        if (!session?.jiraAccessToken) {
            return { success: false, error: "Jira account not connected. Please log in again." };
        }

        const supabase = await createClient();

        // Fetch insight and meeting details
        const { data: insight, error: insightError } = await supabase
            .from("insights")
            .select(`
                *,
                meetings (*)
            `)
            .eq("id", insightId)
            .single();

        if (insightError || !insight) {
            return { success: false, error: "Insight not found in database." };
        }

        const insightWithMeeting = insight as unknown as Insight & { meetings: Meeting };
        const meeting = insightWithMeeting.meetings;
        const accessToken = session.jiraAccessToken;

        const { cloudId, projectKey } = await getJiraContext(accessToken);

        // Build User Story and Description logic
        // Extract timestamp from issue string if it exists (formatted as (HH:MM:SS) or (MM:SS))
        const timestampMatch = insight.issue.match(/\(([\d:]+)\)/);
        const timestamp = timestampMatch ? timestampMatch[1] : "";

        // Simple user story generation based on the insight
        const userStory = insight.issue.includes('[Feature Request]')
            ? `As a user, I want ${insight.issue.replace(/\[.*?\]/, '').trim().split(':')[0]} so that I can achieve my goals.`
            : `As a user, I encounter a friction point regarding ${insight.issue.replace(/\[.*?\]/, '').trim().split(':')[0]} and I need it to be more intuitive.`;

        // Build ADF Description
        const descriptionADF = doc(
            p(strong("User Story:")),
            blockQuote(p(userStory)),
            p(strong("Severity: "), text(insight.severity.toUpperCase())),
            p(strong("Context: "), text(insight.issue)),
            p(strong("Meeting Highlight: "),
                meeting.video_url
                    ? a({ href: meeting.video_url + (timestamp ? `#t=${timestamp}` : "") })(text("View in Recording"))
                    : text("N/A")
            )
        );

        // Create Jira Issue
        const createIssueResponse = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                fields: {
                    project: {
                        key: projectKey,
                    },
                    summary: `Insight: ${insight.issue.substring(0, 100)}${insight.issue.length > 100 ? "..." : ""}`,
                    description: descriptionADF,
                    issuetype: {
                        name: insight.issue.includes('[Feature Request]') ? "Story" : "Task",
                    },
                },
            }),
        });

        const result = await createIssueResponse.json();

        if (!createIssueResponse.ok) {
            console.error("Jira API Error:", result);
            return {
                success: false,
                error: result.errors ? Object.values(result.errors).join(", ") : "Jira API rejected the request."
            };
        }

        const issueKey = result.key;

        // Update database
        const { error: updateError } = await supabase
            .from("insights")
            .update({ jira_ticket_id: issueKey }) // Link the ticket, but don't resolve yet
            .eq("id", insightId);

        if (updateError) {
            return { success: false, error: "Issue created in Jira, but failed to update local database." };
        }

        revalidatePath("/insights");
        revalidatePath(`/meetings/${meeting.id}`);

        return { success: true, issueKey };

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("pushToJira critical error:", err);
        return { success: false, error: `Critical Error: ${message}` };
    }
}
