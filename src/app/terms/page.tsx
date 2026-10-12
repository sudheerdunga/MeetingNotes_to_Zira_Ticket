import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-20">
            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 py-6 max-w-4xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/KodaSync_Logo_1.png?v=3" alt="KodaSync Logo" className="h-auto w-32" />
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 pt-12">
                <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
                <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
                    <p>
                        <strong>Last Updated: July 20, 2026</strong>
                    </p>
                    
                    <section className="space-y-4 mt-8">
                        <h2 className="text-2xl font-semibold text-black">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using KodaSync ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">2. Description of Service</h2>
                        <p>
                            KodaSync provides AI-powered meeting analysis and integration tools to transform conversations into actionable insights. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">3. User Accounts</h2>
                        <p>
                            To use certain features of the Service, you must register for an account. You agree to provide accurate information and are solely responsible for maintaining the confidentiality of your account credentials. You are responsible for all activities that occur under your account.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">4. Data and Privacy</h2>
                        <p>
                            Your privacy is important to us. Our collection and use of your data, including meeting transcripts and associated metadata, are governed by our Privacy Policy. By using KodaSync, you consent to our data practices as described in the Privacy Policy.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">5. Acceptable Use</h2>
                        <p>
                            You agree not to use the Service to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Violate any applicable laws or regulations.</li>
                            <li>Infringe upon the rights of others, including intellectual property or privacy rights.</li>
                            <li>Distribute malicious code, spam, or engage in activities that disrupt the Service.</li>
                            <li>Record meetings without obtaining necessary consent from all participants as required by applicable law.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">6. Limitation of Liability</h2>
                        <p>
                            KodaSync and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the Service. We provide the Service "as is" without any warranties of any kind.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">7. Subscriptions, Payments & 14-Day Refund Policy</h2>
                        <p>
                            KodaSync provides paid subscription plans billed on a monthly or annual recurring basis as displayed on our pricing page. All prices are in USD. Payments are securely processed through our authorized Merchant of Record, Creem (creem.io).
                        </p>
                        <p>
                            <strong>14-Day Money-Back Guarantee:</strong> We offer a 14-day 100% money-back guarantee for all first-time subscription purchases. If KodaSync does not meet your expectations within 14 days of subscribing, simply contact us at{" "}
                            <a href="mailto:onboarding@kodasync.app" className="underline hover:text-black">
                                onboarding@kodasync.app
                            </a>{" "}
                            and we will issue a full refund to your original payment method.
                        </p>
                        <p>
                            <strong>Cancellations:</strong> You may cancel your subscription at any time through your account settings or customer billing portal. Upon cancellation, your access remains active until the end of your prepaid billing period, with no further charges.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">8. Changes to Terms</h2>
                        <p>
                            We reserve the right to update these Terms at any time. We will notify users of significant changes by posting the updated Terms on this page. Your continued use of the Service after changes are published constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">9. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms of Service, billing, or refunds, please contact us at{" "}
                            <a href="mailto:onboarding@kodasync.app" className="underline hover:text-black">
                                onboarding@kodasync.app
                            </a>.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
