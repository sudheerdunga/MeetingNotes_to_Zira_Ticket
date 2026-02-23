
"use client";

import { pushToJira } from "@/lib/actions/jira";
import { useState } from "react";
import { ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";

export function JiraButton({ insightId, hasTicket }: { insightId: string; hasTicket: boolean }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isNotConnected = error === "Jira account not connected";

    const handlePush = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await pushToJira(insightId);
            if (!result.success) {
                setError(result.error || "Failed to push to Jira");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        signIn("atlassian", { callbackUrl: window.location.href });
    };

    if (hasTicket) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#52c41a', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} />
                <span>In Jira</span>
            </div>
        );
    }

    if (isNotConnected) {
        return (
            <div style={{ marginTop: '10px' }}>
                <button
                    onClick={handleConnect}
                    className="btn btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        width: 'auto',
                        backgroundColor: '#0052CC', // Jira Blue
                    }}
                >
                    <ExternalLink size={14} />
                    Connect Jira
                </button>
                <p style={{ color: 'var(--secondary-foreground)', opacity: 0.7, fontSize: '0.7rem', marginTop: '5px' }}>
                    Required to push insights
                </p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '10px' }}>
            <button
                onClick={handlePush}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    width: 'auto',
                }}
            >
                {loading ? (
                    <RefreshCw size={14} className="animate-spin" />
                ) : (
                    <ExternalLink size={14} />
                )}
                {loading ? "Pushing..." : "Push to Jira"}
            </button>
            {error && (
                <p style={{ color: '#ff4d4f', fontSize: '0.75rem', marginTop: '5px', margin: 0 }}>
                    {error}
                </p>
            )}
        </div>
    );
}
