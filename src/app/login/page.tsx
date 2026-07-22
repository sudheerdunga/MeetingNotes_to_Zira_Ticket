import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default async function LoginPage() {
    const session = await auth()
    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center selection:bg-foreground selection:text-background p-4">
            <Link href="/" className="mb-8">
                <img src="/KodaSync_Logo_1.png?v=3" alt="KodaSync Logo" className="h-auto w-48 logo-light" />
                <img src="/KodaSync_Logo_1_Dark.png" alt="KodaSync Logo" className="h-auto w-48 logo-dark" />
            </Link>
            
            <Card className="w-full max-w-md shadow-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Welcome to KodaSync
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Transform your meetings into actionable insights
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground font-medium">
                                Sign in with
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <form
                            action={async () => {
                                "use server"
                                await signIn("google", { redirectTo: "/" })
                            }}
                        >
                            <Button variant="outline" type="submit" className="w-full h-11 flex items-center justify-center gap-2 border-border hover:bg-accent text-foreground">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                                    <path d="M4.405 11.9c-.2-.6-.314-1.241-.314-1.9 0-.659.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>
                        </form>

                        <form
                            action={async () => {
                                "use server"
                                await signIn("atlassian", { redirectTo: "/" })
                            }}
                        >
                            <Button variant="outline" type="submit" className="w-full h-11 flex items-center justify-center gap-2 border-border hover:bg-accent text-foreground">
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
                            </Button>
                        </form>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center text-center pb-6">
                    <p className="text-xs text-muted-foreground">
                        By signing in, you agree to our <Link href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
