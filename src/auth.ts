import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Atlassian from "next-auth/providers/atlassian"


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
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            session.jiraAccessToken = token.jiraAccessToken as string
            return session
        },
    },
})
