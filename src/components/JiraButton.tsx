
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        signIn("atlassian", { callbackUrl: window.location.href });
    };

    if (hasTicket) {
        return (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={15} />
                <span>Synced in Jira</span>
            </div>
        );
    }

    if (isNotConnected) {
        return (
            <div className="mt-2">
                <button
                    onClick={handleConnect}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0052CC] text-white hover:bg-[#0747A6] transition-all shadow-xs cursor-pointer"
                >
                    <ExternalLink size={13} />
                    <span>Connect Jira Cloud</span>
                </button>
                <p className="text-[11px] text-muted-foreground mt-1">
                    Required to sync insights directly to your backlog
                </p>
            </div>
        );
    }

    return (
        <div className="mt-2">
            <button
                onClick={handlePush}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
                {loading ? (
                    <RefreshCw size={13} className="animate-spin" />
                ) : (
                    <ExternalLink size={13} />
                )}
                <span>{loading ? "Pushing to Jira..." : "Push to Jira Cloud"}</span>
            </button>
            {error && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
