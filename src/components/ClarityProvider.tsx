"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

        // Avoid running in development or if the project ID is missing
        if (process.env.NODE_ENV === "development" || !projectId) {
            return;
        }

        Clarity.init(projectId);
    }, []);

    return <>{children}</>;
}