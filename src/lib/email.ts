import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "sudheer.analytics@gmail.com";
const senderEmail = process.env.SENDER_EMAIL || "KodaSync <onboarding@kodasync.app>";

export async function sendWaitlistConfirmation(email: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not defined. Skipping email sending.");
        return;
    }

    const results = await Promise.allSettled([
        // 1. Send welcome email to user
        resend.emails.send({
            from: senderEmail,
            to: email,
            subject: "Welcome to the KodaSync Beta Waitlist!",
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827; line-height: 1.6;">
                    <div style="margin-bottom: 24px;">
                        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">Welcome to KodaSync 👋</h2>
                    </div>
                    <p style="font-size: 15px; color: #374151;">Hi there,</p>
                    <p style="font-size: 15px; color: #374151;">
                        Thank you for joining the KodaSync beta waitlist! We built KodaSync to end the pain of rewatching customer calls just to write Jira tickets.
                    </p>
                    <p style="font-size: 15px; color: #374151;">
                        We're rolling out access to product teams in small batches. We'll send you an invite as soon as your account is ready to connect with your Fireflies/Fathom meetings and Jira board.
                    </p>
                    <p style="font-size: 15px; color: #374151;">
                        Have questions or a specific interview workflow you'd like us to support? Simply reply to this email—we read every message.
                    </p>
                    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                        Best regards,<br/>
                        <strong style="color: #111827;">The KodaSync Team</strong><br/>
                        <a href="https://kodasync.app" style="color: #4f46e5; text-decoration: none;">kodasync.app</a>
                    </div>
                </div>
            `,
        }),
        // 2. Send notification to admin
        resend.emails.send({
            from: senderEmail,
            to: adminEmail,
            subject: `New Waitlist Signup: ${email}`,
            html: `
                <div style="font-family: sans-serif; padding: 16px;">
                    <h3>New Beta Waitlist Signup</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `,
        }),
    ]);

    for (const res of results) {
        if (res.status === "rejected") {
            console.error("Failed to send email via Resend:", res.reason);
        } else if (res.value.error) {
            console.error("Resend API returned error:", res.value.error);
        }
    }
}
