import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { createInsight } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Video, FileText } from "lucide-react";
import { InsightCard } from "@/components/InsightCard";

export default async function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const supabase = await createClient();

    const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", id)
        .single();

    // In testing mode (no session), we allow viewing. 
    // If session exists, we check if it's the owner or a test user.
    const isTestUser = session?.user?.email?.includes('test');
    const isOwner = session?.user?.email && meeting?.user_id === session.user.email;
    const isTestingMode = !session?.user; // Assume testing mode if no session since we disabled middleware protection

    if (meetingError || !meeting || (!isOwner && !isTestUser && !isTestingMode)) {
        notFound();
    }

    const { data: insights } = await supabase
        .from("insights")
        .select("*")
        .eq("meeting_id", id)
        .order("created_at", { ascending: false });

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <header className="header" style={{ alignItems: "flex-start", marginBottom: "30px" }}>
                <div>
                    <Link href="/meetings" style={{ fontSize: "0.9rem", color: "var(--secondary-foreground)", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px", opacity: 0.7 }}>
                        ← Back to Meetings
                    </Link>
                    <h2 style={{ fontSize: "1.8rem", margin: "0 0 10px 0" }}>{meeting.summary || "Untitled Meeting"}</h2>
                    <div style={{ display: "flex", gap: "20px", fontSize: "0.9rem", opacity: 0.7 }}>
                        <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
                        {meeting.video_url && (
                            <a href={meeting.video_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--primary)", textDecoration: "none" }}>
                                <Video size={14} /> Video Recording
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
                {/* Main Content: Transcript */}
                <div>
                    <div className="card" style={{ minHeight: "200px" }}>
                        <div className="card-header" style={{ marginBottom: "15px" }}>
                            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FileText size={18} /> Transcript
                            </h3>
                        </div>
                        <div className="card-content" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                            {meeting.transcript || <span style={{ opacity: 0.6, fontStyle: "italic" }}>No transcript available.</span>}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Insights */}
                <div>
                    <div className="card" style={{ marginBottom: "20px" }}>
                        <div className="card-header" style={{ marginBottom: "15px" }}>
                            <h3 className="card-title">Add Insight</h3>
                        </div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <form action={createInsight as any}>
                            <input type="hidden" name="meeting_id" value={id} />

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                                <input
                                    type="text"
                                    name="issue"
                                    required
                                    placeholder="What is the issue?"
                                    className="form-input"
                                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: "100%" }}
                                />

                                <select
                                    name="severity"
                                    className="form-select"
                                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: "100%" }}
                                >
                                    <option value="low">Low Severity</option>
                                    <option value="medium">Medium Severity</option>
                                    <option value="high">High Severity</option>
                                    <option value="critical">Critical Severity</option>
                                </select>

                                <input
                                    type="text"
                                    name="jira_ticket_id"
                                    placeholder="Jira Ticket ID (Optional)"
                                    className="form-input"
                                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: "100%" }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "8px" }}>
                                Add Insight
                            </button>
                        </form>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Insights ({insights?.length || 0})</h3>

                        {insights && insights.length > 0 ? (
                            insights.map(insight => (
                                <InsightCard key={insight.id} initialInsight={insight} />
                            ))
                        ) : (
                            <p style={{ opacity: 0.6, fontStyle: "italic", fontSize: "0.9rem" }}>No insights recorded for this meeting.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

