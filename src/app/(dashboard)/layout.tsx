import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProductTour } from "@/components/ProductTour";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const isNewUser = (session.user as any)?.isNewUser === true;
    const hasSeenTour = (session.user as any)?.hasSeenTour === true;
    const shouldShowTour = isNewUser && !hasSeenTour;

    return (
        <div className="app-container">
            {shouldShowTour && <ProductTour userEmail={session.user?.email || ""} />}
            <Sidebar session={session} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
