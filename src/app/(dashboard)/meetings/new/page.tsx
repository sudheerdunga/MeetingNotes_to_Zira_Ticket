"use client";
import { createMeeting } from "@/app/actions";

export default function NewMeetingPage() {
    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <header className="header">
                <h2>New Meeting</h2>
            </header>

            <div className="card">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form action={createMeeting as any} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label htmlFor="summary" style={{ fontWeight: 500 }}>Summary</label>
                        <input
                            type="text"
                            id="summary"
                            name="summary"
                            required
                            className="form-input"
                            style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}
                            placeholder="Weekly Sync"
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label htmlFor="video_url" style={{ fontWeight: 500 }}>Video URL (Optional)</label>
                        <input
                            type="url"
                            id="video_url"
                            name="video_url"
                            className="form-input"
                            style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}
                            placeholder="https://zoom.us/rec/..."
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label htmlFor="transcript" style={{ fontWeight: 500 }}>Transcript</label>
                        <textarea
                            id="transcript"
                            name="transcript"
                            rows={10}
                            className="form-textarea"
                            style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", resize: "vertical" }}
                            placeholder="Paste meeting transcript here..."
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Meeting</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
