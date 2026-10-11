import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
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
                <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
                <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
                    <p>
                        <strong>Last Updated: July 20, 2026</strong>
                    </p>

                    <section className="space-y-4 mt-8">
                        <h2 className="text-2xl font-semibold text-black">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when you create an account, connect third-party integrations (like Google Calendar or Atlassian Jira), or use our meeting analysis tools. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Account details (name, email address).</li>
                            <li>Integration data (calendar events, workspace metadata).</li>
                            <li>Meeting transcripts and associated audio/video recordings processed through the Service.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to operate, maintain, and improve our services. Specifically, meeting data is processed using AI models to extract action items, summarize discussions, and generate insights. We do not sell your personal data or use your meeting data to train foundational models without your explicit consent.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">3. Data Security and Storage</h2>
                        <p>
                            We implement industry-standard security measures to protect your information. Your data is encrypted at rest and in transit. We retain your information only for as long as necessary to provide you with the Service or as required by law.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">4. Third-Party Services</h2>
                        <p>
                            KodaSync integrates with third-party services (e.g., Google, Atlassian, AI providers). Your use of those integrations is also governed by their respective privacy policies. We are not responsible for the privacy practices of third-party platforms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">5. Your Rights</h2>
                        <p>
                            Depending on your location, you may have the right to access, update, or delete your personal information. You can manage your account settings or contact us directly to exercise these rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">6. Updates to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-black">7. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy or our data practices, please contact us at{" "}
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
