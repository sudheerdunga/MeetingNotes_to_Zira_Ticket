import { inngest } from "./client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "sudheer.analytics@gmail.com";
const senderEmail = process.env.SENDER_EMAIL || "KodaSync <onboarding@kodasync.app>";

export const sendWaitlistEmails = inngest.createFunction(
    { id: "send-waitlist-emails" },
    { event: "user/waitlist.joined" },
    async ({ event, step }) => {
        const { email } = event.data;

        await step.run("send-admin-notification", async () => {
            const { error } = await resend.emails.send({
                from: senderEmail,
                to: adminEmail,
                subject: "New Beta Waitlist Signup",
                html: `<p>A new user has joined the beta waitlist!</p><p>Email: <strong>${email}</strong></p>`,
            });
            if (error) throw error;
        });

        await step.run("send-user-welcome-email", async () => {
            const { error } = await resend.emails.send({
                from: senderEmail,
                to: email,
                subject: "Welcome to the Waitlist!",
                html: `<p>Hi there,</p><p>Thank you for joining our beta waitlist. We will notify you when you can access the platform.</p><p>Best,<br/>The Team</p>`,
            });
            if (error) throw error;
        });

        return { success: true, email };
    }
);
