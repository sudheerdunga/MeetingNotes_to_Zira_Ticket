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

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState("Welcome to the Founding 5! We'll reach out shortly.");
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden selection:bg-black selection:text-white">
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
            <section className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">Deep Dive</Badge>
                    <h2 className="text-4xl font-bold tracking-tight">Built for High-Growth Product Teams</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-gray-200">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center mb-4">
                                <BarChart3 size={24} />
                            </div>
                            <CardTitle>Sentiment Heatmaps</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            See which parts of your onboarding flow or feature set are making users angry vs delighting them.
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center mb-4">
                                <LinkIcon size={24} />
                            </div>
                            <CardTitle>The &quot;Receipts&quot; Link</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            Every Jira ticket includes a direct timestamp link. No more &quot;I can&apos;t reproduce this&quot; from developers.
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center mb-4">
                                <Users size={24} />
                            </div>
                            <CardTitle>Bi-Directional Sync</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-500">
                            When the ticket hits &quot;Done&quot; in Jira, we notify you so you can close the loop with the customer instantly.
                        </CardContent>
                    </Card>
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
                        <CheckCircle2 size={40} className="mb-4 text-green-600" />
                        {feedback}
                    </div>
                )}
            </section>

            <footer className="py-10 border-t border-gray-100 text-center text-gray-400 text-sm">
                &copy; 2026 KodaSync. All rights reserved. Built for modern product teams.
            </footer>
        </div>
    );
}
