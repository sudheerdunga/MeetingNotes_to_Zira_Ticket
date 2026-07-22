"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding() {
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
