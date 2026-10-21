
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        accessToken?: string
        jiraAccessToken?: string
        user: {
            /** The user's postal address. */
            address: string
            hasOnboarded?: boolean
            hasSeenTour?: boolean
            isNewUser?: boolean
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        accessToken?: string
        jiraAccessToken?: string
        jiraRefreshToken?: string
        hasOnboarded?: boolean
        hasSeenTour?: boolean
        isNewUser?: boolean
    }
}
