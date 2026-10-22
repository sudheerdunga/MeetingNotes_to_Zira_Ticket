import { Opportunity } from "@/types";
import { FolderKanban, MessageSquare, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
    const insights = opportunity.insights || [];
    const uniqueMeetings = new Set(insights.map((i) => i.meeting_id)).size;

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs hover:border-foreground/30 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
                {/* Header tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/60 uppercase tracking-wider">
                        <FolderKanban size={12} />
                        Roadmap Theme
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                        {new Date(opportunity.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                </div>

                {/* Opportunity Title */}
                <h3 className="text-base font-bold text-foreground leading-snug mb-2">
                    {opportunity.title}
                </h3>

                {/* Root Cause Note */}
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground leading-relaxed mb-4">
                    <span className="font-semibold text-foreground mr-1">Root Cause:</span>
                    {opportunity.root_cause || "Recurring pattern detected across customer interviews."}
                </div>
            </div>

            <div>
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border/60">
                        <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                            <MessageSquare size={14} />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Evidence</div>
                            <div className="text-xs font-bold text-foreground">{uniqueMeetings || 1} Calls</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border/60">
                        <div className="p-1.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            <TrendingDown size={14} />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Impact</div>
                            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                {opportunity.sentiment_impact || "High Friction"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Link */}
                <Link
                    href="/opportunities"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
                >
                    <span>Inspect Cluster & Evidence</span>
                    <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}
