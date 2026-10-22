"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    PlusCircle,
    Search,
    AlertCircle,
    CheckCircle2,
    Video,
    FolderKanban,
    ExternalLink,
    Clock,
    ArrowUpRight,
    MessageSquare,
    Bug,
    Sparkles,
    Flame,
    X,
    Filter,
} from "lucide-react";
import { JiraButton } from "@/components/JiraButton";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Opportunity, Meeting } from "@/types";

export interface DashboardInsight {
    id: string;
    meeting_id: string;
    issue: string;
    severity: "low" | "medium" | "high" | "critical";
    jira_ticket_id: string | null;
    status: "open" | "resolved";
    created_at: string;
    opportunity_id?: string | null;
    meetings?: {
        user_id: string;
        summary: string | null;
    } | null;
}

interface DashboardClientProps {
    userName: string;
    userEmail: string;
    initialInsights: DashboardInsight[];
    initialMeetings: Meeting[];
    initialOpportunities: Opportunity[];
}

export function parseInsight(issueStr: string) {
    if (!issueStr) {
        return {
            category: "friction" as const,
            title: "Untitled Feedback",
            quote: "",
            timestamp: "",
        };
    }

    const typeMatch = issueStr.match(/^\[(.*?)\]/);
    const rawType = (typeMatch ? typeMatch[1] : "").toLowerCase();

    let category: "bug" | "friction" | "feature" = "friction";
    if (rawType.includes("bug")) category = "bug";
    else if (rawType.includes("feature")) category = "feature";
    else if (rawType.includes("friction")) category = "friction";

    const withoutType = issueStr.replace(/^\[.*?\]/, "").trim();
    const colonIdx = withoutType.indexOf(":");

    let title = withoutType;
    let content = "";
    if (colonIdx !== -1) {
        title = withoutType.substring(0, colonIdx).trim();
        content = withoutType.substring(colonIdx + 1).trim();
    }

    // Extract quote if wrapped in quotation marks
    const quoteMatch = content.match(/"(.*?)"/);
    const quote = quoteMatch ? quoteMatch[1] : (content || "");

    // Extract timestamp like (04:12)
    const timestampMatch = content.match(/\(([\d:]+)\)/);
    const timestamp = timestampMatch ? timestampMatch[1] : "";

    return {
        category,
        title: title || "Feedback Point",
        quote,
        timestamp,
    };
}

export function DashboardClient({
    userName,
    userEmail,
    initialInsights,
    initialMeetings,
    initialOpportunities,
}: DashboardClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<"all" | "bug" | "friction" | "feature">("all");
    const [selectedStatus, setSelectedStatus] = useState<"all" | "open" | "jira">("all");
    const [selectedSeverity, setSelectedSeverity] = useState<"all" | "critical" | "high" | "medium" | "low">("all");

    // Selected insight for the right detail panel
    const [selectedInsightId, setSelectedInsightId] = useState<string | null>(
        initialInsights.length > 0 ? initialInsights[0].id : null
    );

    // KPI Metrics Calculations
    const totalMeetings = initialMeetings.length;
    const criticalAndHighCount = useMemo(() => {
        return initialInsights.filter(
            (i) => (i.severity === "critical" || i.severity === "high") && i.status === "open"
        ).length;
    }, [initialInsights]);

    const jiraSyncedCount = useMemo(() => {
        return initialInsights.filter((i) => Boolean(i.jira_ticket_id)).length;
    }, [initialInsights]);

    const categoryCounts = useMemo(() => {
        const counts = { bug: 0, friction: 0, feature: 0 };
        initialInsights.forEach((ins) => {
            const { category } = parseInsight(ins.issue);
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }, [initialInsights]);

    // Filtered Insights
    const filteredInsights = useMemo(() => {
        return initialInsights.filter((item) => {
            const parsed = parseInsight(item.issue);

            // Category filter
            if (selectedCategory !== "all" && parsed.category !== selectedCategory) {
                return false;
            }

            // Status filter
            if (selectedStatus === "open" && item.status !== "open") return false;
            if (selectedStatus === "jira" && !item.jira_ticket_id) return false;

            // Severity filter
            if (selectedSeverity !== "all" && item.severity !== selectedSeverity) {
                return false;
            }

            // Search query filter
            if (searchQuery.trim().length > 0) {
                const q = searchQuery.toLowerCase();
                const matchTitle = parsed.title.toLowerCase().includes(q);
                const matchQuote = parsed.quote.toLowerCase().includes(q);
                const matchMeeting = (item.meetings?.summary || "").toLowerCase().includes(q);
                if (!matchTitle && !matchQuote && !matchMeeting) return false;
            }

            return true;
        });
    }, [initialInsights, selectedCategory, selectedStatus, selectedSeverity, searchQuery]);

    // Ensure an insight is always selected if items exist in the filtered list
    const activeInsight = useMemo(() => {
        if (!selectedInsightId && filteredInsights.length > 0) {
            return filteredInsights[0];
        }
        return filteredInsights.find((i) => i.id === selectedInsightId) || filteredInsights[0] || null;
    }, [selectedInsightId, filteredInsights]);

    const activeParsed = activeInsight ? parseInsight(activeInsight.issue) : null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* 1. Header & Quick Action */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Feedback Engine
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Product Command Center
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Synthesized customer feedback, friction points, and Jira synchronization for {userName || "Product Team"}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/meetings/new"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-90 transition-all shadow-sm active:scale-95"
                    >
                        <PlusCircle size={16} />
                        <span>New Meeting</span>
                    </Link>
                </div>
            </div>

            {/* 2. KPI Pulse Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs hover:border-border/80 transition-all">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Interviews Analyzed</span>
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            <Video size={16} />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                        {totalMeetings}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Full calls synced across sources
                    </p>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs hover:border-border/80 transition-all">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Urgent Blockers</span>
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                            <Flame size={16} />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-baseline gap-2">
                        <span>{criticalAndHighCount}</span>
                        {criticalAndHighCount > 0 && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                Needs Action
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Critical & high severity feedback
                    </p>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs hover:border-border/80 transition-all">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Jira Cloud Synced</span>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                        {jiraSyncedCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Stories & bugs active in backlog
                    </p>
                </div>

                {/* Metric 4 */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs hover:border-border/80 transition-all">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Thematic Clusters</span>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            <FolderKanban size={16} />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                        {initialOpportunities.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Root-cause roadmap opportunities
                    </p>
                </div>
            </div>

            {/* 3. Filter & Categorization Bar */}
            <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                selectedCategory === "all"
                                    ? "bg-foreground text-background shadow-xs font-semibold"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            <span>All Feedback</span>
                            <span className="text-[10px] opacity-75 font-mono">({initialInsights.length})</span>
                        </button>

                        <button
                            onClick={() => setSelectedCategory("bug")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                selectedCategory === "bug"
                                    ? "bg-rose-600 text-white shadow-xs font-semibold"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            <Bug size={13} />
                            <span>Bugs</span>
                            <span className="text-[10px] opacity-75 font-mono">({categoryCounts.bug})</span>
                        </button>

                        <button
                            onClick={() => setSelectedCategory("friction")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                selectedCategory === "friction"
                                    ? "bg-amber-600 text-white shadow-xs font-semibold"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            <Flame size={13} />
                            <span>UX Friction</span>
                            <span className="text-[10px] opacity-75 font-mono">({categoryCounts.friction})</span>
                        </button>

                        <button
                            onClick={() => setSelectedCategory("feature")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                selectedCategory === "feature"
                                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            <Sparkles size={13} />
                            <span>Feature Requests</span>
                            <span className="text-[10px] opacity-75 font-mono">({categoryCounts.feature})</span>
                        </button>
                    </div>

                    {/* Search & Status Controls */}
                    <div className="flex items-center gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Filter quotes or keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Status Select */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg text-xs border border-border bg-card text-foreground focus:outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open Issues</option>
                            <option value="jira">Synced in Jira</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4. High-Density Split View Layout */}
            {filteredInsights.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                        <Search size={22} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">No matching insights found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Try adjusting your filters, or record/upload a new interview transcript to extract fresh insights.
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                        {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("all");
                                    setSelectedStatus("all");
                                    setSelectedSeverity("all");
                                }}
                                className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
                            >
                                Reset Filters
                            </button>
                        )}
                        <Link
                            href="/meetings/new"
                            className="px-3 py-1.5 rounded-md text-xs font-medium bg-foreground text-background"
                        >
                            + Add Meeting
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT PANEL: High-Density Feed (7 Columns) */}
                    <div className="lg:col-span-7 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1">
                            <span>Showing {filteredInsights.length} feedback items</span>
                            <span className="hidden sm:inline">Click any item to view verbatim receipt & push to Jira</span>
                        </div>

                        {filteredInsights.map((insight) => {
                            const parsed = parseInsight(insight.issue);
                            const isSelected = activeInsight?.id === insight.id;

                            // Badge colors
                            const categoryBadge = {
                                bug: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
                                friction: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
                                feature: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
                            }[parsed.category];

                            const severityPill = {
                                critical: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
                                high: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
                                medium: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
                                low: "text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
                            }[insight.severity];

                            return (
                                <div
                                    key={insight.id}
                                    onClick={() => setSelectedInsightId(insight.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                                        isSelected
                                            ? "border-foreground bg-card ring-1 ring-foreground/20 shadow-sm"
                                            : "border-border bg-card/60 hover:bg-card hover:border-border/90 hover:shadow-2xs"
                                    }`}
                                >
                                    {/* Top meta tags */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {/* Category Tag */}
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${categoryBadge}`}>
                                                {parsed.category === "bug" && <Bug size={11} />}
                                                {parsed.category === "friction" && <Flame size={11} />}
                                                {parsed.category === "feature" && <Sparkles size={11} />}
                                                {parsed.category}
                                            </span>

                                            {/* Severity Tag */}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${severityPill}`}>
                                                {insight.severity}
                                            </span>
                                        </div>

                                        {/* Jira Status Pill */}
                                        {insight.jira_ticket_id ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                                                <CheckCircle2 size={11} />
                                                <span>{insight.jira_ticket_id}</span>
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground/70">
                                                Unsynced
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-semibold text-foreground leading-snug mb-1.5">
                                        {parsed.title}
                                    </h3>

                                    {/* Verbatim quote teaser */}
                                    {parsed.quote && (
                                        <p className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed bg-muted/40 p-2 rounded-md border-l-2 border-foreground/30">
                                            &ldquo;{parsed.quote}&rdquo;
                                        </p>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-2.5 border-t border-border/40">
                                        <span className="truncate max-w-[220px]">
                                            {insight.meetings?.summary || "Direct Call Sync"}
                                        </span>
                                        <span>
                                            {new Date(insight.created_at).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* RIGHT PANEL: Detail & Jira Dispatcher Stage (5 Columns, Sticky) */}
                    <div className="lg:col-span-5 sticky top-6">
                        {activeInsight && activeParsed ? (
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                                {/* Header with category & Jira status */}
                                <div className="border-b border-border/60 pb-4">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                                            Insight Inspector
                                        </span>
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            ID: {activeInsight.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-foreground leading-tight">
                                        {activeParsed.title}
                                    </h2>
                                </div>

                                {/* Verbatim Customer Receipt Player */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                                            <MessageSquare size={13} className="text-foreground" />
                                            Verbatim Customer Receipt
                                        </span>
                                        {activeParsed.timestamp && (
                                            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                                                <Clock size={11} /> {activeParsed.timestamp}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border/80 relative">
                                        <div className="text-sm leading-relaxed text-foreground font-medium italic">
                                            &ldquo;{activeParsed.quote || "No verbatim quote captured."}&rdquo;
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>Source: {activeInsight.meetings?.summary || "Meeting Transcript"}</span>
                                            <Link
                                                href={`/meetings/${activeInsight.meeting_id}`}
                                                className="text-foreground hover:underline font-medium inline-flex items-center gap-1"
                                            >
                                                <span>View Full Transcript</span>
                                                <ArrowUpRight size={11} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Jira Cloud Dispatcher */}
                                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                                <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.95 4.34 4.34 4.34V2.84a.84.84 0 00-.84-.84h-9.63z" fill="#2684FF" />
                                                <path d="M6.77 6.77c0 2.4 1.95 4.35 4.35 4.35h1.78v1.7c0 2.4 1.95 4.34 4.34 4.34V7.61a.84.84 0 00-.84-.84H6.77z" fill="#0052CC" />
                                                <path d="M2 11.54c0 2.4 1.95 4.35 4.35 4.35h1.77v1.7c0 2.4 1.96 4.35 4.35 4.35v-9.56a.84.84 0 00-.84-.84H2z" fill="#0052CC" />
                                            </svg>
                                            Jira Cloud Sync
                                        </span>
                                        {activeInsight.jira_ticket_id ? (
                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                                                Active in Backlog
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Ready to Push
                                            </span>
                                        )}
                                    </div>

                                    {activeInsight.jira_ticket_id ? (
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                                            <div>
                                                <div className="text-xs text-muted-foreground">Connected Issue</div>
                                                <div className="text-sm font-bold text-foreground">
                                                    {activeInsight.jira_ticket_id}
                                                </div>
                                            </div>
                                            <a
                                                href={`https://atlassian.net/browse/${activeInsight.jira_ticket_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                                            >
                                                <span>Open in Jira</span>
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Generate an engineering issue in Jira Cloud formatted with this verbatim quote, customer context, and severity tag.
                                            </p>
                                            <div className="pt-1">
                                                <JiraButton insightId={activeInsight.id} hasTicket={false} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Metadata Breakdown */}
                                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                                    <div className="p-3 rounded-lg border border-border/60 bg-card">
                                        <div className="text-muted-foreground">Severity Level</div>
                                        <div className="font-semibold capitalize text-foreground mt-0.5">
                                            {activeInsight.severity} Severity
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border border-border/60 bg-card">
                                        <div className="text-muted-foreground">Feedback Type</div>
                                        <div className="font-semibold capitalize text-foreground mt-0.5">
                                            {activeParsed.category}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* 5. Thematic Opportunities (Modernized Cluster Section) */}
            {initialOpportunities.length > 0 && (
                <div className="pt-8 border-t border-border/60 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-foreground">
                                    Cross-Meeting Opportunities
                                </h2>
                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    AI Clustered
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Recurring friction points synthesized across multiple customer interviews.
                            </p>
                        </div>
                        <Link
                            href="/opportunities"
                            className="text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1"
                        >
                            <span>View Full Roadmap</span>
                            <ArrowUpRight size={13} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {initialOpportunities.map((opp) => (
                            <OpportunityCard key={opp.id} opportunity={opp} />
                        ))}
                    </div>
                </div>
            )}

            {/* 6. Recent Meetings Strip */}
            <div className="pt-8 border-t border-border/60 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Recent Customer Calls</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Recently ingested transcripts and recording links.
                        </p>
                    </div>
                    <Link
                        href="/meetings"
                        className="text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1"
                    >
                        <span>View All Calls</span>
                        <ArrowUpRight size={13} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {initialMeetings.slice(0, 3).map((meeting) => (
                        <Link
                            href={`/meetings/${meeting.id}`}
                            key={meeting.id}
                            className="p-4 rounded-xl border border-border bg-card hover:border-foreground/40 hover:shadow-2xs transition-all group block"
                        >
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span className="font-mono text-[11px]">
                                    {new Date(meeting.created_at).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                                {meeting.video_url && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                                        <Video size={10} /> Video
                                    </span>
                                )}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground line-clamp-1 mb-1">
                                {meeting.summary || "Untitled Call"}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {meeting.transcript || "No transcript available"}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
