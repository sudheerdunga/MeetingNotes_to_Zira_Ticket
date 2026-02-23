
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    PlusCircle,
    ArrowRight,
    Video,
    Zap,
    CheckCircle2,
    BarChart3,
    Link as LinkIcon,
    RefreshCcw,
    Sparkles,
    Search,
    Users
} from 'lucide-react';
import './landing.css';
import { joinWaitlist } from '@/app/actions';

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
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lp-body">
            {/* Navigation */}
            <nav className="lp-nav lp-container">
                <Link href="/" className="lp-logo">InsightLoop</Link>
                <div className="lp-nav-actions">
                    <Link href="/login" className="lp-btn-ghost">Login</Link>
                    <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="lp-btn-primary">
                        Join Waitlist
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="lp-hero lp-container">
                <span className="lp-badge">Free for Early Beta Adaptors</span>
                <h1 className="lp-hero-headline">
                    Stop Rewatching User Interviews. <br />
                    <span style={{ color: 'var(--lp-primary)' }}>Start Fixing What’s Broken.</span>
                </h1>
                <p className="lp-hero-subheadline">
                    InsightLoop automatically extracts high-signal friction points from your Fireflies or Fathom calls and turns them into ready-to-code Jira tickets.
                </p>
                <div className="lp-hero-cta-group">
                    <button
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        className="lp-btn-primary"
                        style={{ fontSize: '1.1rem', padding: '16px 32px' }}
                    >
                        Get Early Access — Free for Beta
                    </button>
                    <div className="lp-social-proof">
                        "Integrates with Fireflies, Fathom, and Jira in 60 seconds."
                    </div>
                </div>
            </header>

            {/* Problem Section */}
            <section className="lp-section lp-container animate-fade-in">
                <div className="lp-section-header">
                    <span className="lp-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>The Pain</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>The "Product Manager's Paradox"</h2>
                </div>

                <div className="lp-problem-grid">
                    <div className="lp-problem-card">
                        <Video className="lp-primary" style={{ marginBottom: '16px' }} />
                        <h4>100+ Hours of Recordings</h4>
                        <p>You have dozens of weekly customer calls sitting idle in your cloud, gathering dust.</p>
                    </div>
                    <div className="lp-problem-card">
                        <Search className="lp-primary" style={{ marginBottom: '16px' }} />
                        <h4>Hidden "Aha!" Moments</h4>
                        <p>Critical feedback is buried somewhere in those transcripts, but you don't have time to find them.</p>
                    </div>
                    <div className="lp-problem-card">
                        <Zap className="lp-primary" style={{ marginBottom: '16px' }} />
                        <h4>Roadmap Guestimation</h4>
                        <p>Critical bugs stay in the transcript while your roadmap priorities remain a guess.</p>
                    </div>
                </div>
            </section>

            {/* Solution Section (Magic) */}
            <section className="lp-section lp-container animate-fade-in">
                <div className="lp-section-header">
                    <span className="lp-badge">The Magic</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>From Conversation to Resolution</h2>
                </div>

                <div className="lp-steps">
                    <div className="lp-step-row">
                        <div className="lp-step-content">
                            <span className="lp-step-number">Step 01</span>
                            <h3 className="lp-step-headline">Auto-Ingest.</h3>
                            <p className="lp-step-body">
                                We sync directly with your existing meeting assistant. No new bot to invite, no extra clicks required. We listen where you already work.
                            </p>
                        </div>
                        <div className="lp-step-visual">
                            <RefreshCcw size={80} style={{ color: 'var(--lp-primary)', opacity: 0.8 }} />
                        </div>
                    </div>

                    <div className="lp-step-row">
                        <div className="lp-step-content">
                            <span className="lp-step-number">Step 02</span>
                            <h3 className="lp-step-headline">Evidence-Based Insights.</h3>
                            <p className="lp-step-body">
                                Our AI doesn't just summarize; it finds the exact moment a user struggled and maps the friction with precision timestamps.
                            </p>
                        </div>
                        <div className="lp-step-visual">
                            <Sparkles size={80} style={{ color: 'var(--lp-accent)', opacity: 0.8 }} />
                        </div>
                    </div>

                    <div className="lp-step-row">
                        <div className="lp-step-content">
                            <span className="lp-step-number">Step 03</span>
                            <h3 className="lp-step-headline">One-Click Engineering.</h3>
                            <p className="lp-step-body">
                                Push a fully formatted ticket to Jira, complete with the user story, acceptance criteria, and the direct evidence link.
                            </p>
                        </div>
                        <div className="lp-step-visual">
                            <Zap size={80} style={{ color: '#fbbf24', opacity: 0.8 }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Detail */}
            <section className="lp-section lp-container animate-fade-in">
                <div className="lp-section-header">
                    <span className="lp-badge">Deep Dive</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Built for High-Growth Product Teams</h2>
                </div>

                <div className="lp-feature-grid">
                    <div className="lp-feature-card">
                        <div className="lp-feature-icon"><BarChart3 size={24} /></div>
                        <h3>Sentiment Heatmaps</h3>
                        <p style={{ color: '#a1a1aa', marginTop: '12px' }}>
                            See which parts of your onboarding flow or feature set are making users angry vs delighting them.
                        </p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-feature-icon"><LinkIcon size={24} /></div>
                        <h3>The "Receipts" Link</h3>
                        <p style={{ color: '#a1a1aa', marginTop: '12px' }}>
                            Every Jira ticket includes a direct timestamp link. No more "I can't reproduce this" from developers.
                        </p>
                    </div>
                    <div className="lp-feature-card">
                        <div className="lp-feature-icon"><Users size={24} /></div>
                        <h3>Bi-Directional Sync</h3>
                        <p style={{ color: '#a1a1aa', marginTop: '12px' }}>
                            When the ticket hits "Done" in Jira, we notify you so you can close the loop with the customer instantly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Beta Closer */}
            <section className="lp-beta-footer lp-container animate-fade-in">
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px' }}>
                    Help us build the future of <br />Product Discovery.
                </h2>
                <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto' }}>
                    "We are looking for <strong>5 Product Managers</strong> to join our founding beta. You'll get free access for life and direct influence over our feature roadmap."
                </p>

                {!submitted ? (
                    <form className="lp-waitlist-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your work email"
                            className="lp-input"
                            required
                            disabled={loading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button type="submit" className="lp-btn-primary" disabled={loading}>
                            {loading ? 'Joining...' : 'Join the Beta Waitlist'}
                        </button>
                    </form>
                ) : (
                    <div style={{ marginTop: '40px', padding: '24px', borderRadius: '24px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--lp-primary)', fontWeight: 600 }}>
                        <CheckCircle2 size={32} style={{ margin: '0 auto 12px' }} />
                        {feedback}
                    </div>
                )}
            </section>

            <footer className="lp-container" style={{ padding: '40px 0', borderTop: '1px solid var(--lp-border)', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                &copy; 2026 InsightLoop. All rights reserved. Built for modern product teams.
            </footer>
        </div>
    );
}
