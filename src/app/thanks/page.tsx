import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
    SparklesIcon as Sparkles,
    LinkIcon,
    ArrowRightIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";

export default function ThanksPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white relative overflow-hidden flex flex-col justify-between">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] -z-10 pointer-events-none rounded-full"></div>

            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 py-6 max-w-5xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/KodaSync_Logo_1.png?v=3" alt="KodaSync Logo" className="h-auto w-32" />
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/login">
                        <Button variant="outline">Sign In</Button>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto px-6 py-12 flex flex-col items-center text-center">
                
                {/* Success Icon */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <CheckCircleIcon className="w-12 h-12" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 animate-ping opacity-30"></div>
                </div>

                <Badge variant="secondary" className="mb-4 py-1.5 px-4 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
                    Payment Successful • Subscription Active
                </Badge>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    Welcome to KodaSync!
                </h1>

                <p className="text-lg md:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
                    Thank you for your purchase. Your subscription is now confirmed, and you&apos;re ready to turn customer interview calls into ready-to-code Jira tickets.
                </p>

                {/* Next Steps Card */}
                <Card className="w-full text-left bg-gray-50/70 border-gray-200/80 shadow-sm p-6 md:p-8 rounded-3xl mb-8">
                    <h2 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        Next Steps to Get Started
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center shrink-0">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold text-black text-base">Sign In to Your Workspace</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Click below to log in using the email address you used during checkout.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center shrink-0">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold text-black text-base">Connect Your Integrations</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Link your Jira Cloud project and your Fireflies.ai or Fathom meeting assistant in under 60 seconds.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center shrink-0">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold text-black text-base">Sync Insights with 1-Click</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Upload or ingest interview transcripts and generate Jira tickets with timestamped customer quotes automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mb-8">
                    <Link href="/login" className="w-full">
                        <Button size="lg" className="w-full h-13 text-base font-semibold flex items-center justify-center gap-2">
                            Go to Dashboard
                            <ArrowRightIcon className="w-4 h-4" />
                        </Button>
                    </Link>
                    <a href="mailto:onboarding@kodasync.app" className="w-full">
                        <Button variant="outline" size="lg" className="w-full h-13 text-base flex items-center justify-center gap-2">
                            <EnvelopeIcon className="w-4 h-4" />
                            Email Support
                        </Button>
                    </a>
                </div>

                {/* Creem Notice & Receipt Info */}
                <div className="text-xs text-gray-400 max-w-lg space-y-1">
                    <p>
                        A payment receipt from <strong>Creem</strong> has been sent to your email.
                    </p>
                    <p>
                        Need assistance or 1-on-1 setup help? Reach out directly to{" "}
                        <a href="mailto:onboarding@kodasync.app" className="underline text-gray-600 hover:text-black">
                            onboarding@kodasync.app
                        </a>.
                    </p>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full py-8 text-center text-xs text-gray-400 border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>&copy; 2026 KodaSync. All rights reserved.</div>
                    <div className="flex gap-4">
                        <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
