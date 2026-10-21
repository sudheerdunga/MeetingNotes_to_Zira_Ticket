import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Atlassian from "next-auth/providers/atlassian"


import { getUserOnboardingStatus } from "@/lib/user-onboarding"

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google,
        Atlassian({
            id: "atlassian",
            clientId: process.env.AUTH_JIRA_ID,
            clientSecret: process.env.AUTH_JIRA_SECRET,
            authorization: { params: { scope: "read:jira-user read:jira-work write:jira-work offline_access" } }
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
                // if jira
                if (account.provider === 'atlassian') {
                    token.jiraAccessToken = account.access_token
                    token.jiraRefreshToken = account.refresh_token
                }
            }

            if (token.email) {
                if (token.hasOnboarded === undefined || token.hasSeenTour === undefined) {
                    try {
                        const status = await getUserOnboardingStatus(token.email as string);
                        token.hasOnboarded = status.hasOnboarded;
                        token.hasSeenTour = status.hasSeenTour;
                        token.isNewUser = status.isNewUser;
                    } catch (e) {
                        console.error("Error checking onboarding status in jwt:", e);
                        token.hasOnboarded = true;
                        token.hasSeenTour = true;
                        token.isNewUser = false;
                    }
                }
            }

            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            session.jiraAccessToken = token.jiraAccessToken as string
            if (session.user) {
                session.user.hasOnboarded = typeof token.hasOnboarded === "boolean" ? token.hasOnboarded : true;
                session.user.hasSeenTour = typeof token.hasSeenTour === "boolean" ? token.hasSeenTour : true;
                session.user.isNewUser = typeof token.isNewUser === "boolean" ? token.isNewUser : false;
            }
            return session
        },
    },
})
