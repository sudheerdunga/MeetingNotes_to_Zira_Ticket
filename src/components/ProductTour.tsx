"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Step, STATUS } from "react-joyride";

const Joyride = dynamic(
    () => import("react-joyride").then((mod) => mod.Joyride as any), 
    { ssr: false }
) as any;

export function ProductTour() {
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

    useEffect(() => {
        // Check local storage to ensure the tour only runs once
        const hasSeenTour = localStorage.getItem('has_seen_tour');
        if (!hasSeenTour) {
            // Slight delay so the UI can load and elements are in the DOM
            setTimeout(() => {
                setRun(true);
            }, 1000);
        }
    }, []);

    const handleJoyrideCallback = (data: any) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
        
        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('has_seen_tour', 'true');
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
