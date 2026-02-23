
'use server'

import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { doc, p, strong, text, a, blockQuote } from "@atlaskit/adf-utils/builders";
import { revalidatePath } from "next/cache";

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
    const session = await auth();
    if (!session?.jiraAccessToken) {
        throw new Error("Jira account not connected");
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
        throw new Error("Insight not found");
    }

    const meeting = insight.meetings;
    const accessToken = session.jiraAccessToken;

    try {
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
            throw new Error(result.errors ? Object.values(result.errors).join(", ") : "Failed to create Jira issue");
        }

        const issueKey = result.key;

        // Update database
        const { error: updateError } = await supabase
            .from("insights")
            .update({ jira_ticket_id: issueKey, status: 'resolved' }) // Marking as resolved since it's now tracked in Jira
            .eq("id", insightId);

        if (updateError) {
            throw updateError;
        }

        revalidatePath("/insights");
        revalidatePath(`/meetings/${meeting.id}`);

        return { success: true, issueKey };

    } catch (err: any) {
        console.error("pushToJira error:", err);
        return { success: false, error: err.message };
    }
}
