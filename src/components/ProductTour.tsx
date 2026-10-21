"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Step, STATUS } from "react-joyride";

const Joyride = dynamic(
    () => import("react-joyride").then((mod) => mod.Joyride as any), 
    { ssr: false }
) as any;

import { markTourAsSeenAction } from "@/app/onboarding/actions";

export function ProductTour({ userEmail }: { userEmail?: string }) {
    const [run, setRun] = useState(false);

    const steps: Step[] = [
        {
            target: '.dashboard',
            content: 'Welcome to your dashboard! Here is a quick tour of what you can do.',
            placement: 'center',
        },
        {
            target: 'a[href="/meetings/new"]',
            content: 'Click here to add a new meeting and generate Jira tickets instantly.',
            placement: 'bottom',
        },
        {
            target: 'a[href="/opportunities"]',
            content: 'We group your urgent insights into opportunities. View your product roadmap here.',
            placement: 'bottom',
        },
        {
            target: 'a[href="/insights"]',
            content: 'Check out all the individual insights extracted from your user interviews.',
            placement: 'bottom',
        },
        {
            target: 'aside .mt-auto',
            content: 'Finally, click here to open your profile menu and connect with Jira to automatically sync tickets.',
            placement: 'right',
        }
    ];

    const markSeen = () => {
        try {
            localStorage.setItem('has_seen_tour', 'true');
            if (userEmail) {
                localStorage.setItem(`has_seen_tour_${userEmail}`, 'true');
            }
            // Mark in cookies
            document.cookie = "has_seen_tour=true; path=/; max-age=315360000; SameSite=Lax";
            // Persist to database
            markTourAsSeenAction().catch((err) => {
                console.error("Failed to persist tour seen state to database:", err);
            });
        } catch (e) {
            console.error("Error storing tour state in localStorage:", e);
        }
    };

    useEffect(() => {
        // Check local storage and cookie to ensure the tour only runs once
        const globalSeen = localStorage.getItem('has_seen_tour') === 'true';
        const userSeen = userEmail ? localStorage.getItem(`has_seen_tour_${userEmail}`) === 'true' : false;
        const cookieSeen = document.cookie.includes('has_seen_tour=true');

        if (!globalSeen && !userSeen && !cookieSeen) {
            // Slight delay so the UI can load and elements are in the DOM
            const timer = setTimeout(() => {
                setRun(true);
                // Mark seen right away so that even if the user refreshes or closes the page on step 1,
                // the tour is considered shown once and will never annoy them again
                markSeen();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [userEmail]);

    const handleJoyrideCallback = (data: any) => {
        const { status, action } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
        const isClosingAction = action === 'close' || action === 'skip' || action === 'stop';
        
        if (finishedStatuses.includes(status) || isClosingAction) {
            setRun(false);
            markSeen();
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#000',
                    zIndex: 10000,
                },
            }}
        />
    );
}
