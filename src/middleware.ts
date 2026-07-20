import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  // Allow access to public pages, auth routes, webhooks, and Inngest
  const isPublicRoute =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname === "/landing" ||
    req.nextUrl.pathname === "/login"

  if (
    isPublicRoute ||
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/api/webhooks") ||
    req.nextUrl.pathname.startsWith("/api/inngest")
  ) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Allow authenticated users to access all other routes
  return NextResponse.next()
})

// Configure which routes to protect
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
