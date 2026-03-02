import { auth } from "@/auth";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InsightCard } from "@/components/InsightCard";
import { OpportunityCard } from "@/components/OpportunityCard";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/landing");
  }

  const supabase = await createClient();

  // Fetch recent insights
  let insightsQuery = supabase
    .from("insights")
    .select(`
            *,
            meetings!inner (
                user_id,
                summary
            )
        `)
    .limit(3)
    .order("created_at", { ascending: false });

  // Fetch recent meetings
  let meetingsQuery = supabase
    .from("meetings")
    .select("*")
    .limit(3)
    .order("created_at", { ascending: false });

  // Fetch Opportunities
  let opportunitiesQuery = supabase
    .from("opportunities")
    .select(`
        *,
        insights (id, meeting_id)
    `)
    .eq('status', 'active')
    .order("created_at", { ascending: false })
    .limit(2);

  // Filter if not a test user
  if (!session.user?.email?.includes('test')) {
    insightsQuery = insightsQuery.or(`user_id.eq.${session.user?.id},user_id.eq.system-fireflies-import`, { foreignTable: 'meetings' });
    meetingsQuery = meetingsQuery.or(`user_id.eq.${session.user?.id},user_id.eq.system-fireflies-import`);
    opportunitiesQuery = opportunitiesQuery.eq('user_id', session.user?.id);
  }

  const [{ data: insights }, { data: meetings }, { data: opportunities }] = await Promise.all([
    insightsQuery,
    meetingsQuery,
    opportunitiesQuery
  ]);

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: "var(--secondary-foreground)", opacity: 0.7 }}>
            Welcome back, {session?.user?.name || "User"}
          </p>
        </div>
        <Link href="/meetings/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} />
          New Meeting
        </Link>
      </header>

      {/* NEW: Opportunities Section */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>Urgent Opportunities</h3>
            <span style={{ backgroundColor: 'var(--primary)', color: 'var(--background)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>AI CLUSTERED</span>
          </div>
          <Link href="/opportunities" style={{ fontSize: "0.9rem", color: "var(--primary)", textDecoration: "none" }}>View product roadmap</Link>
        </div>

        <div className="grid">
          {opportunities && opportunities.length > 0 ? (
            opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp as any} />
            ))
          ) : (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", border: '1px dashed var(--border)', background: 'transparent' }}>
              <p style={{ margin: 0, opacity: 0.7 }}>No opportunities detected yet. AI will cluster insights as you add more meetings.</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>Recent Insights</h3>
          <Link href="/insights" style={{ fontSize: "0.9rem", color: "var(--primary)", textDecoration: "none" }}>View all</Link>
        </div>

        <div className="grid">
          {insights && insights.length > 0 ? (
            insights.map((insight: any) => (
              <InsightCard key={insight.id} initialInsight={insight as any} />
            ))
          ) : (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px" }}>
              <div style={{ marginBottom: "15px", opacity: 0.5 }}>
                <Search size={48} />
              </div>
              <h4 style={{ margin: "0 0 10px 0" }}>No insights found</h4>
              <p style={{ margin: 0, opacity: 0.7 }}>Insights from your meetings will appear here.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>Recent Meetings</h3>
          <Link href="/meetings" style={{ fontSize: "0.9rem", color: "var(--primary)", textDecoration: "none" }}>View all</Link>
        </div>

        <div className="grid">
          {meetings && meetings.length > 0 ? (
            meetings.map((meeting: any) => (
              <Link href={`/meetings/${meeting.id}`} key={meeting.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title" style={{ margin: 0 }}>{meeting.summary || "Untitled"}</h4>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(meeting.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: '15px 0 0 0', opacity: 0.7, fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {meeting.transcript || "No transcript"}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px" }}>
              <p style={{ margin: 0, opacity: 0.7 }}>No meetings recorded yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
