
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import Link from "next/link";
import { PlusCircle, Video, FileText } from "lucide-react";

export default async function MeetingsPage() {
    const session = await auth();

    // Debug: Log session info
    console.log("Session user info:", {
        id: session?.user?.id,
        email: session?.user?.email,
        name: session?.user?.name
    });

    const supabase = await createClient();

    // List meetings: user's personal ones + system imports
    let query = supabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false });

    if (session?.user?.id && !session.user.email?.includes('test')) {
        query = query.or(`user_id.eq.${session.user.id},user_id.eq.system-fireflies-import`);
    }

    const { data: meetings, error } = await query;

    if (error) {
        console.error("Error fetching meetings:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
    } else {
        console.log("Meetings fetched successfully:", meetings?.length || 0, "meetings found");
    }

    return (
        <div>
            <header className="header" style={{ marginBottom: "20px" }}>
                <h2>Meetings</h2>
                <Link href="/meetings/new" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <PlusCircle size={18} />
                    <span>New Meeting</span>
                </Link>
            </header>

            {meetings && meetings.length > 0 ? (
                <div className="grid">
                    {meetings.map((meeting) => (
                        <div key={meeting.id} className="card">
                            <div className="card-header">
                                <h3 className="card-title">{meeting.summary || "Untitled Meeting"}</h3>
                                <span style={{ fontSize: "0.8rem", color: "var(--secondary-foreground)", opacity: 0.6 }}>
                                    {new Date(meeting.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="card-content" style={{ marginTop: "10px" }}>
                                {meeting.transcript ? (
                                    <p style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {meeting.transcript}
                                    </p>
                                ) : (
                                    <p style={{ fontStyle: "italic", opacity: 0.6 }}>No transcript available.</p>
                                )}
                            </div>
                            <div className="card-footer">
                                <div style={{ display: "flex", gap: "10px" }}>
                                    {meeting.video_url && (
                                        <a href={meeting.video_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--primary)", textDecoration: "none" }}>
                                            <Video size={14} /> Video
                                        </a>
                                    )}
                                    {meeting.transcript && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px", opacity: 0.7 }}>
                                            <FileText size={14} /> Transcript
                                        </div>
                                    )}
                                </div>
                                <Link href={`/meetings/${meeting.id}`} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ opacity: 0.5, marginBottom: "20px" }}>
                        <Video size={48} />
                    </div>
                    <h3>No meetings found</h3>
                    <p style={{ marginBottom: "20px", opacity: 0.7 }}>Record your first meeting to get started.</p>
                    <Link href="/meetings/new" className="btn btn-primary">
                        Add Meeting
                    </Link>
                </div>
            )}
        </div>
    );
}
