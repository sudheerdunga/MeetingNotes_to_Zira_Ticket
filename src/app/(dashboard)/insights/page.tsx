import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { InsightCard } from "@/components/InsightCard";

export default async function InsightsPage() {
    const session = await auth();
    const supabase = await createClient();

    let query = supabase
        .from("insights")
        .select(`
            *,
            meetings!inner (
                user_id,
                summary
            )
        `);

    // If we have a session and it's not a test user, filter by their user_id
    // But also show system-imported insights
    if (session?.user?.email && !session.user.email.includes('test')) {
        query = query.eq('meetings.user_id', session.user.email);
    }

    const { data: insights, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching insights:", error);
    }

    return (
        <div>
            <header className="header" style={{ marginBottom: "20px" }}>
                <div>
                    <h2>Insights Library</h2>
                    <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>Track behavioral patterns across all your user interviews.</p>
                </div>
            </header>

            {insights && insights.length > 0 ? (
                <div className="grid">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(insights as any[]).map((insight) => (
                        <InsightCard key={insight.id} initialInsight={insight} />
                    ))}
                </div>
            ) : (
                <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ opacity: 0.5, marginBottom: "20px" }}>
                        <Lightbulb size={48} />
                    </div>
                    <h3>No insights found</h3>
                    <p style={{ marginBottom: "20px", opacity: 0.7 }}>Insights are generated from your meetings.</p>
                    <Link href="/meetings" className="btn btn-primary">
                        Go to Meetings
                    </Link>
                </div>
            )}
        </div>
    );
}

