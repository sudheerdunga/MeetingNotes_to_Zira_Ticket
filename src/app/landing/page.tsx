"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    VideoCameraIcon as Video,
    BoltIcon as Zap,
    ChartBarIcon as BarChart3,
    LinkIcon,
    ArrowPathIcon as RefreshCcw,
    SparklesIcon as Sparkles,
    MagnifyingGlassIcon as Search,
    UsersIcon as Users
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircle2 } from '@heroicons/react/24/solid';
import { joinWaitlist } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const EXAMPLES = [
    {
        id: "bug",
        label: "🐞 Critical Bug",
        transcriptStart: "\"…and when I try to check out, the ",
        highlight: "checkout button just spins and throws a 500 error",
        transcriptEnd: ". We've seen this on three different accounts this week.\"",
        ticketTitle: "Checkout 500 Error on Payment Flow",
        priority: "High",
        priorityColor: "bg-red-900/40 text-red-300 border-red-800/50",
        desc: "Extracted from call transcript. Customer reported recurring payment gateway failure.",
        tags: ["friction", "bug"]
    },
    {
        id: "feature",
        label: "💡 Feature Request",
        transcriptStart: "\"…our team really needs a way to ",
        highlight: "bulk export the user list to CSV",
        transcriptEnd: ". Doing it one by one takes hours every Friday.\"",
        ticketTitle: "Bulk Export Users to CSV",
        priority: "Medium",
        priorityColor: "bg-blue-900/40 text-blue-300 border-blue-800/50",
        desc: "User requested ability to export user lists to CSV for weekly reporting workflows.",
        tags: ["feature request", "export"]
    },
    {
        id: "ux",
        label: "🌪️ UX Friction",
        transcriptStart: "\"…I couldn't figure out how to invite my team members. The ",
        highlight: "settings icon is really hidden away at the bottom left",
        transcriptEnd: ".\"",
        ticketTitle: "Improve Team Invite Discoverability",
        priority: "Medium",
        priorityColor: "bg-amber-900/40 text-amber-300 border-amber-800/50",
        desc: "User struggled to find the team invite flow. Settings icon placement is causing friction.",
        tags: ["friction", "onboarding", "ui/ux"]
    }
];

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState("Welcome to the Founding 5! We'll reach out shortly.");
    const [loading, setLoading] = useState(false);
    const [activeExampleIndex, setActiveExampleIndex] = useState(0);
    const activeExample = EXAMPLES[activeExampleIndex];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('email', email);

        try {
            const result = await joinWaitlist(formData);
            if (result.success || result.message) {
                setSubmitted(true);
                if (result.message) setFeedback(result.message);
            } else if (result.error) {
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-black font-sans overflow-x-hidden selection:bg-black selection:text-white relative z-0">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[100px] -z-10 pointer-events-none rounded-full"></div>
            {/* Navigation */}
            <nav className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/KodaSync_Logo_1.png?v=3" alt="KodaSync Logo" className="h-auto w-30" />
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                        Join Waitlist
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Badge variant="secondary" className="mb-8 py-1.5 px-4 text-sm font-medium">Free for Early Beta Adaptors</Badge>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                    Stop Rewatching User Interviews. <br />
                    <span className="text-black/70">Start Fixing What’s Broken.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-12">
                    KodaSync automatically extracts high-signal friction points from your Fireflies or Fathom calls and turns them into ready-to-code Jira tickets.
                </p>
                <div className="flex flex-col items-center gap-4">
                    <Button
                        size="lg"
                        className="text-lg px-8 h-14"
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    >
                        Get Early Access — Free for Beta
                    </Button>
                    <div className="text-sm text-gray-400 font-medium">
                        &quot;Integrates with Fireflies, Fathom, and Jira in 60 seconds.&quot;
                    </div>
                </div>
            </header>

            {/* Hero App Screenshot */}
            {/* Interactive Hero Example */}
            <section className="px-6 pb-24 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Example Tabs */}
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                    {EXAMPLES.map((example, idx) => (
                        <button
                            key={example.id}
                            onClick={() => setActiveExampleIndex(idx)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                                activeExampleIndex === idx 
                                ? 'bg-black text-white border-black shadow-md scale-105' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-black hover:bg-gray-50'
                            }`}
                        >
                            {example.label}
                        </button>
                    ))}
                </div>

                {/* Example Card */}
                <div className="w-full bg-[#0d1117] rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row text-left transition-all duration-300 transform">
                    
                    {/* Left: Call Transcript Snippet */}
                    <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-800 relative">
                        <div className="flex items-center gap-2 text-gray-400 mb-6 font-medium text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                            Call Transcript Snippet
                        </div>
                        <p className="text-gray-300 leading-loose text-lg font-mono">
                            {activeExample.transcriptStart}
                            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 mx-1 rounded font-semibold border border-indigo-500/30 transition-all duration-300">
                                {activeExample.highlight}
                            </span>
                            {activeExample.transcriptEnd}
                        </p>
                    </div>

                    {/* Right: Generated Jira Ticket */}
                    <div className="flex-1 p-8 md:p-10 relative">
                        <div className="flex items-center gap-2 text-gray-400 mb-6 font-medium text-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2c-5.24 0-9.5 4.26-9.5 9.5s4.26 9.5 9.5 9.5 9.5-4.26 9.5-9.5S16.74 2 11.5 2zm-2 14.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                            Generated Jira Ticket
                        </div>
                        
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h4 className="text-white font-semibold text-xl leading-snug transition-all duration-300">
                                {activeExample.ticketTitle}
                            </h4>
                            <span className={`${activeExample.priorityColor} border text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors duration-300`}>
                                Priority: {activeExample.priority}
                            </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed transition-all duration-300">
                            {activeExample.desc}
                        </p>
                        
                        <div className="flex gap-2 flex-wrap">
                            {activeExample.tags.map(tag => (
                                <span key={tag} className="border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-md transition-all duration-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* Problem Section */}
            <section className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4 text-red-600 bg-red-50 border-red-200">The Pain</Badge>
                    <h2 className="text-4xl font-bold tracking-tight">The &quot;Product Manager&apos;s Paradox&quot;</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-gray-50/50 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <Video className="w-8 h-8 text-black mb-4" />
                            <CardTitle>100+ Hours of Recordings</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            You have dozens of weekly customer calls sitting idle in your cloud, gathering dust.
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-50/50 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <Search className="w-8 h-8 text-black mb-4" />
                            <CardTitle>Hidden &quot;Aha!&quot; Moments</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            Critical feedback is buried somewhere in those transcripts, but you don&apos;t have time to find them.
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-50/50 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <Zap className="w-8 h-8 text-black mb-4" />
                            <CardTitle>Roadmap Guestimation</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            Critical bugs stay in the transcript while your roadmap priorities remain a guess.
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Solution Section (Magic) */}
            <section className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100">
                <div className="text-center mb-20">
                    <Badge variant="outline" className="mb-4">The Magic</Badge>
                    <h2 className="text-4xl font-bold tracking-tight">From Conversation to Resolution</h2>
                </div>

                <div className="space-y-24 max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Step 01</span>
                            <h3 className="text-3xl font-bold tracking-tight">Auto-Ingest.</h3>
                            <p className="text-lg text-gray-500">
                                We sync directly with your existing meeting assistant. No new bot to invite, no extra clicks required. We listen where you already work.
                            </p>
                        </div>
                        <div className="flex-1 flex justify-center bg-gray-50 p-12 rounded-3xl border border-gray-100">
                            <RefreshCcw className="w-32 h-32 text-black/80" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                        <div className="flex-1 space-y-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Step 02</span>
                            <h3 className="text-3xl font-bold tracking-tight">Evidence-Based Insights.</h3>
                            <p className="text-lg text-gray-500">
                                Our AI doesn&apos;t just summarize; it finds the exact moment a user struggled and maps the friction with precision timestamps.
                            </p>
                        </div>
                        <div className="flex-1 flex justify-center bg-gray-50 p-12 rounded-3xl border border-gray-100">
                            <Sparkles className="w-32 h-32 text-black/80" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Step 03</span>
                            <h3 className="text-3xl font-bold tracking-tight">One-Click Engineering.</h3>
                            <p className="text-lg text-gray-500">
                                Push a fully formatted ticket to Jira, complete with the user story, acceptance criteria, and the direct evidence link.
                            </p>
                        </div>
                        <div className="flex-1 flex justify-center bg-gray-50 p-12 rounded-3xl border border-gray-100">
                            <Zap className="w-32 h-32 text-black/80" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Detail */}
            <section className="py-24 w-full bg-slate-50/50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">Deep Dive</Badge>
                    <h2 className="text-4xl font-bold tracking-tight">Built for High-Growth Product Teams</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-gray-200 bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center mb-4">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <CardTitle>Sentiment Heatmaps</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            See which parts of your onboarding flow or feature set are making users angry vs delighting them.
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center mb-4">
                                <LinkIcon className="w-6 h-6" />
                            </div>
                            <CardTitle>The &quot;Receipts&quot; Link</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            Every Jira ticket includes a direct timestamp link. No more &quot;I can&apos;t reproduce this&quot; from developers.
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <CardTitle>Bi-Directional Sync</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            When the ticket hits &quot;Done&quot; in Jira, we notify you so you can close the loop with the customer instantly.
                        </CardContent>
                    </Card>
                </div>
                </div>
            </section>

            {/* Maker's Personal Note */}
            <section className="py-24 px-6 max-w-4xl mx-auto border-t border-gray-100">
                <div className="flex flex-col md:flex-row gap-12 items-center bg-gray-50 p-10 rounded-3xl border border-gray-100">
                    <div className="shrink-0">
                        <img src="/maker_profile_pic.png" alt="Maker" className="w-32 h-32 rounded-full object-cover shadow-sm" />
                    </div>
                    <div className="flex-1 space-y-4 text-gray-600 leading-relaxed text-lg">
                        <p>Hey, I’m Sudheer.</p>
                        <p>
                            As a product guy, I noticed a broken loop: we spend hours interviewing users, but those recordings just sit idle in Fireflies or Fathom gathering digital dust. Nobody has time to rewatch hours of video just to copy-paste bugs into Jira.
                        </p>
                        <p>
                            So, I built KodaSync to fix it. It automatically catches high-signal user friction, adds precision timestamps, and generates ready-to-code Jira tickets. Under the hood, a fast Next.js stack powered by Inngest handles the heavy lifting in the background.
                        </p>
                        <p>
                            I’m looking for 5 PMs to join the founding beta for free lifetime access. Let&apos;s build together!
                        </p>
                        <div className="text-sm font-semibold text-black pt-2">
                            &mdash; Sudheer
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 max-w-3xl mx-auto border-t border-gray-100">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-6">
                    <details className="group border-b border-gray-200 pb-4">
                        <summary className="flex justify-between items-center font-semibold cursor-pointer list-none text-lg [&::-webkit-details-marker]:hidden">
                            Do I need to invite another bot to my meetings?
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-500 mt-3">No. KodaSync connects directly to your existing meeting assistants like Fireflies or Fathom. We just process the transcripts they generate without needing an extra bot on the call.</p>
                    </details>
                    <details className="group border-b border-gray-200 pb-4">
                        <summary className="flex justify-between items-center font-semibold cursor-pointer list-none text-lg [&::-webkit-details-marker]:hidden">
                            How does it integrate with Jira?
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-500 mt-3">With one click, we create fully formatted tickets in your Jira workspace. They automatically include a user story, acceptance criteria, and timestamped links back to the exact moment in the recording.</p>
                    </details>
                    <details className="group border-b border-gray-200 pb-4">
                        <summary className="flex justify-between items-center font-semibold cursor-pointer list-none text-lg [&::-webkit-details-marker]:hidden">
                            Is my meeting data safe?
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-500 mt-3">Absolutely. We use enterprise-grade encryption and never use your private meeting transcripts to train foundational AI models.</p>
                    </details>
                    <details className="group border-b border-gray-200 pb-4">
                        <summary className="flex justify-between items-center font-semibold cursor-pointer list-none text-lg [&::-webkit-details-marker]:hidden">
                            What is the pricing for KodaSync?
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-500 mt-3">During our founding beta, KodaSync is completely free for the first 5 Product Managers. Post-beta pricing will be tiered based on your team's transcript volume.</p>
                    </details>
                    <details className="group border-b border-gray-200 pb-4">
                        <summary className="flex justify-between items-center font-semibold cursor-pointer list-none text-lg [&::-webkit-details-marker]:hidden">
                            Can it find bugs in non-English conversations?
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-500 mt-3">Yes! As long as your meeting assistant generates a transcript, our AI can analyze it and extract actionable insights in over 30 languages.</p>
                    </details>
                </div>
            </section>

            {/* Beta Closer */}
            <section className="py-32 px-6 max-w-7xl mx-auto text-center border-t border-gray-100">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
                    Help us build the future of <br />Product Discovery.
                </h2>
                <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-12">
                    &quot;We are looking for <strong className="text-black">5 Product Managers</strong> to join our founding beta. You&apos;ll get free access for life and direct influence over our feature roadmap.&quot;
                </p>

                {!submitted ? (
                    <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
                        <Input
                            type="email"
                            placeholder="Enter your work email"
                            className="h-12 text-base"
                            required
                            disabled={loading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button type="submit" size="lg" className="h-12 w-full sm:w-auto shrink-0" disabled={loading}>
                            {loading ? 'Joining...' : 'Join the Beta Waitlist'}
                        </Button>
                    </form>
                ) : (
                    <div className="max-w-md mx-auto p-8 rounded-2xl bg-gray-50 border border-gray-100 text-black font-semibold flex flex-col items-center">
                        <CheckCircle2 className="w-10 h-10 mb-4 text-green-600" />
                        {feedback}
                    </div>
                )}
            </section>

            <footer className="relative w-full overflow-hidden">
                {/* Soft pastel gradient separator matching the requested style */}
                <div className="w-full h-16 bg-gradient-to-r from-violet-400 via-teal-300 to-green-400 opacity-80 blur-[12px] transform scale-110"></div>
                
                <div className="relative py-10 bg-white text-center text-gray-400 text-sm flex flex-col items-center gap-2 border-t border-gray-50 z-10">
                    <div>&copy; 2026 KodaSync. All rights reserved. Built for modern product teams.</div>
                    <div className="flex gap-4 mt-2">
                        <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
