import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  // If someone visits /landing directly, redirect to home page /
  if (req.nextUrl.pathname === "/landing") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Allow access to public pages, auth routes, webhooks, and Inngest
  const isPublicRoute =
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/terms" ||
    req.nextUrl.pathname === "/privacy" ||
    req.nextUrl.pathname === "/thanks" ||
    req.nextUrl.pathname === "/rework"

  if (
    isPublicRoute ||
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/api/webhooks") ||
    req.nextUrl.pathname.startsWith("/api/inngest")
  ) {
    return NextResponse.next()
  }

  // Handle root /: if not authenticated, serve landing page directly on /
  if (req.nextUrl.pathname === "/") {
    if (!isLoggedIn) {
      return NextResponse.rewrite(new URL("/landing", req.url))
    }
  }

  // Redirect if not authenticated to login for protected routes
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check onboarding status
  const isOnboardingRoute = req.nextUrl.pathname.startsWith("/onboarding")
  const sessionUser = req.auth?.user as any
  const isNewUser = sessionUser?.isNewUser === true
  const hasOnboarded = sessionUser?.hasOnboarded === true || req.cookies.get("has_onboarded")?.value === "true"

  // Only force new users who haven't onboarded to /onboarding
  if (isLoggedIn && isNewUser && !hasOnboarded && !isOnboardingRoute) {
    const onboardingUrl = new URL("/onboarding", req.url)
    return NextResponse.redirect(onboardingUrl)
  }

  // If user has already onboarded or is an existing user, prevent visiting /onboarding
  if (isLoggedIn && (hasOnboarded || !isNewUser) && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Allow authenticated users to access all other routes
  return NextResponse.next()
})

// Configure which routes to protect
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
