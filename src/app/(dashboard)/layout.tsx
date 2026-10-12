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

    return (
        <div className="app-container">
            <ProductTour />
            <Sidebar session={session} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
