"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { JiraButton } from "./JiraButton";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Bug, Flame, Sparkles, MessageSquare } from "lucide-react";
import { parseInsight } from "@/components/dashboard/DashboardClient";

interface Insight {
    id: string;
    meeting_id: string;
    issue: string;
    severity: "low" | "medium" | "high" | "critical";
    status: "open" | "resolved";
    jira_ticket_id?: string | null;
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
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "insights",
                    filter: `id=eq.${insight.id}`,
                },
                (payload) => {
                    setInsight(payload.new as Insight);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [insight.id, supabase]);

    const { category, title, quote, timestamp } = parseInsight(insight.issue);

    const categoryConfig = {
        bug: {
            label: "Bug",
            icon: Bug,
            pill: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
        },
        friction: {
            label: "UX Friction",
            icon: Flame,
            pill: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
        },
        feature: {
            label: "Feature Request",
            icon: Sparkles,
            pill: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
        },
    }[category];

    const severityConfig = {
        critical: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
        high: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
        medium: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
        low: "text-zinc-700 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
    }[insight.severity];

    const CategoryIcon = categoryConfig.icon;

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs hover:border-foreground/30 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
                {/* Header: Category + Severity + Jira */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${categoryConfig.pill}`}>
                            <CategoryIcon size={11} />
                            {categoryConfig.label}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${severityConfig}`}>
                            {insight.severity}
                        </span>
                    </div>

                    <span className="text-[11px] text-muted-foreground font-mono" suppressHydrationWarning>
                        {new Date(insight.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-foreground leading-snug mb-2">
                    {title}
                </h4>

                {/* Verbatim quote */}
                {quote && (
                    <div className="p-3 rounded-lg bg-muted/40 border-l-2 border-foreground/30 text-xs text-muted-foreground italic leading-relaxed mb-3">
                        &ldquo;{quote}&rdquo;
                    </div>
                )}

                {timestamp && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3 font-mono">
                        <Clock size={11} />
                        <span>Happened at {timestamp}</span>
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="pt-3 border-t border-border/50 mt-auto">
                {insight.jira_ticket_id ? (
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            In Jira: {insight.jira_ticket_id}
                        </span>
                        <a
                            href={`https://atlassian.net/browse/${insight.jira_ticket_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                        >
                            <span>Open</span>
                            <ExternalLink size={11} />
                        </a>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">Unsynced</span>
                        <JiraButton insightId={insight.id} hasTicket={false} />
                    </div>
                )}
            </div>
        </div>
    );
}
