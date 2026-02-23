
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { JiraButton } from "./JiraButton";
import { AlertCircle, CheckCircle2, Info, Clock, ExternalLink } from "lucide-react";

interface Insight {
    id: string;
    meeting_id: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'resolved';
    jira_ticket_id?: string;
    created_at: string;
}

export function InsightCard({ initialInsight }: { initialInsight: Insight }) {
    const [insight, setInsight] = useState(initialInsight);
    const supabase = createClient();

    // Real-time updates via Supabase Subscriptions
    useEffect(() => {
        const channel = supabase
            .channel(`insight-status-${insight.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'insights',
                    filter: `id=eq.${insight.id}`,
                },
                (payload) => {
                    console.log('Insight updated in real-time:', payload.new);
                    setInsight(payload.new as Insight);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [insight.id, supabase]);

    // Parsing the structured issue string
    // Format: "[Type] Title: "Quote" (Timestamp)"
    const parseIssue = (issueStr: string) => {
        const typeMatch = issueStr.match(/^\[(.*?)\]/);
        const type = typeMatch ? typeMatch[1] : "Insight";

        const rest = issueStr.replace(/^\[.*?\]/, "").trim();
        const parts = rest.split(':');
        const title = parts[0]?.trim() || "Untitled Insight";

        const content = parts.slice(1).join(':').trim();
        const quoteMatch = content.match(/"(.*?)"/);
        const quote = quoteMatch ? quoteMatch[1] : "";

        const timestampMatch = content.match(/\(([\d:]+)\)/);
        const timestamp = timestampMatch ? timestampMatch[1] : "";

        return { type, title, quote, timestamp };
    };

    const { title, quote, timestamp } = parseIssue(insight.issue);

    const severityConfig = {
        low: { color: "#2196f3", bg: "rgba(33, 150, 243, 0.1)", icon: Info },
        medium: { color: "#ffab00", bg: "rgba(255, 171, 0, 0.1)", icon: Info },
        high: { color: "#ff5722", bg: "rgba(255, 87, 34, 0.1)", icon: AlertCircle },
        critical: { color: "#ff1744", bg: "rgba(255, 23, 68, 0.1)", icon: AlertCircle }
    };

    const config = severityConfig[insight.severity] || severityConfig.low;
    const Icon = config.icon;

    return (
        <div className="card" style={{ padding: '24px', border: `1px solid ${insight.status === 'resolved' ? 'var(--border)' : config.color + '44'}` }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        backgroundColor: config.bg,
                        color: config.color,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Icon size={12} />
                        {insight.severity}
                    </div>
                    {insight.status === 'resolved' && (
                        <div style={{ color: '#00c853', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <CheckCircle2 size={12} />
                            TRACKED
                        </div>
                    )}
                </div>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }} suppressHydrationWarning>
                    {new Date(insight.created_at).toLocaleDateString()}
                </span>
            </div>

            <div className="card-content" style={{ opacity: 1, color: 'var(--foreground)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                    {title}
                </h4>

                {quote && (
                    <blockquote style={{
                        margin: '0 0 16px 0',
                        paddingLeft: '12px',
                        borderLeft: `2px solid ${config.color}`,
                        fontStyle: 'italic',
                        opacity: 0.8,
                        fontSize: '0.95rem'
                    }}>
                        &quot;{quote}&quot;
                    </blockquote>
                )}

                {timestamp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', opacity: 0.6, marginBottom: '16px' }}>
                        <Clock size={14} />
                        <span>Happened at {timestamp}</span>
                    </div>
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                {insight.jira_ticket_id ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <a
                            href={`https://atlassian.net/browse/${insight.jira_ticket_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontSize: '0.85rem'
                            }}
                        >
                            <ExternalLink size={14} />
                            Jira: {insight.jira_ticket_id}
                        </a>
                        <div style={{ fontSize: '0.75rem', color: '#00c853', fontWeight: 600 }}>
                            Linked
                        </div>
                    </div>
                ) : (
                    <JiraButton insightId={insight.id} hasTicket={false} />
                )}
            </div>
        </div>
    );
}
