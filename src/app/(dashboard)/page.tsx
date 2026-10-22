import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient, DashboardInsight } from "@/components/dashboard/DashboardClient";
import { Opportunity, Meeting } from "@/types";

export default async function Dashboard() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const supabase = await createClient();

    // Fetch insights with joined meeting summaries
    let insightsQuery = supabase
        .from("insights")
        .select(`
            id,
            meeting_id,
            issue,
            severity,
            jira_ticket_id,
            status,
            created_at,
            opportunity_id,
            meetings!inner (
                user_id,
                summary
            )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

    // Fetch recent meetings
    let meetingsQuery = supabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    // Fetch active Opportunities
    let opportunitiesQuery = supabase
        .from("opportunities")
        .select(`
            *,
            insights (id, meeting_id)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

    // Filter if not a test user
    if (session.user?.email && !session.user.email.includes("test")) {
        insightsQuery = insightsQuery.eq("meetings.user_id", session.user.email);
        meetingsQuery = meetingsQuery.eq("user_id", session.user.email);
        opportunitiesQuery = opportunitiesQuery.eq("user_id", session.user.email);
    }

    const [{ data: insights }, { data: meetings }, { data: opportunities }] = await Promise.all([
        insightsQuery,
        meetingsQuery,
        opportunitiesQuery,
    ]);

    return (
        <div className="w-full">
            <DashboardClient
                userName={session.user?.name || "Product Leader"}
                userEmail={session.user?.email || ""}
                initialInsights={(insights || []) as unknown as DashboardInsight[]}
                initialMeetings={(meetings || []) as unknown as Meeting[]}
                initialOpportunities={(opportunities || []) as unknown as Opportunity[]}
            />
        </div>
    );
}
