"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { markUserOnboarded, markUserTourSeen } from "@/lib/user-onboarding";

export async function completeOnboarding() {
    const session = await auth();
    if (session?.user?.email) {
        await markUserOnboarded(session.user.email);
    }

    // Set a cookie that expires in 10 years (effectively permanent)
    const cookieStore = await cookies();
    cookieStore.set("has_onboarded", "true", {
        expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    redirect("/");
}

export async function markTourAsSeenAction() {
    const session = await auth();
    if (session?.user?.email) {
        await markUserTourSeen(session.user.email);
    }

    const cookieStore = await cookies();
    cookieStore.set("has_seen_tour", "true", {
        expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return { success: true };
}
