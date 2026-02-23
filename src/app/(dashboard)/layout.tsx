
import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/landing");
    }

    return (
        <div className="app-container">
            <Sidebar session={session} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
