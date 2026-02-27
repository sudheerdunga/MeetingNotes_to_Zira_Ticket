import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import styles from "./login.module.css"

export default async function LoginPage() {
    const session = await auth()
    if (session?.user) {
        redirect("/")
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="20" fill="url(#gradient)" />
                            <path d="M24 14v20M14 24h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="gradient" x1="4" y1="4" x2="44" y2="44">
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className={styles.title}>Welcome to KodaSync</h1>
                    <p className={styles.subtitle}>
                        Transform your meetings into actionable insights
                    </p>
                </div>

                <div className={styles.divider}>
                    <span>Sign in with</span>
                </div>

                <div className={styles.authButtons}>
                    <form
                        action={async () => {
                            "use server"
                            await signIn("google", { redirectTo: "/" })
                        }}
                    >
                        <button type="submit" className={styles.googleButton}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                                <path d="M4.405 11.9c-.2-.6-.314-1.241-.314-1.9 0-.659.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <form
                        action={async () => {
                            "use server"
                            await signIn("atlassian", { redirectTo: "/" })
                        }}
                    >
                        <button type="submit" className={styles.jiraButton}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.95 4.34 4.34 4.34V2.84a.84.84 0 00-.84-.84h-9.63z" fill="#2684FF" />
                                <path d="M6.77 6.77c0 2.4 1.95 4.35 4.35 4.35h1.78v1.7c0 2.4 1.95 4.34 4.34 4.34V7.61a.84.84 0 00-.84-.84H6.77z" fill="url(#jira-gradient)" />
                                <path d="M2 11.54c0 2.4 1.95 4.35 4.35 4.35h1.77v1.7c0 2.4 1.96 4.35 4.35 4.35v-9.56a.84.84 0 00-.84-.84H2z" fill="url(#jira-gradient2)" />
                                <defs>
                                    <linearGradient id="jira-gradient" x1="17.24" x2="10.4" y1="7.61" y2="14.45" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#0052CC" />
                                        <stop offset="0.92" stopColor="#2684FF" />
                                    </linearGradient>
                                    <linearGradient id="jira-gradient2" x1="12.47" x2="5.62" y1="12.38" y2="19.23" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#0052CC" />
                                        <stop offset="0.92" stopColor="#2684FF" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            Continue with Jira
                        </button>
                    </form>
                </div>

                <p className={styles.footer}>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    )
}
