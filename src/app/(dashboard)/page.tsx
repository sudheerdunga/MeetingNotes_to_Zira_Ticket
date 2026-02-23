import { auth } from "@/auth";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/landing");
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: "var(--secondary-foreground)", opacity: 0.7 }}>
            Welcome back, {session?.user?.name || "Test User"}
          </p>
        </div>
        <Link href="/meetings/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} />
          New Meeting
        </Link>
      </header>

      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>Recent Insights</h3>
          <Link href="/insights" style={{ fontSize: "0.9rem", color: "var(--primary)", textDecoration: "none" }}>View all</Link>
        </div>

        <div className="grid">
          {/* Placeholder for when there are no insights */}
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px" }}>
            <div style={{ marginBottom: "15px", opacity: 0.5 }}>
              <Search size={48} />
            </div>
            <h4 style={{ margin: "0 0 10px 0" }}>No insights found</h4>
            <p style={{ margin: 0, opacity: 0.7 }}>Start by recording or uploading a meeting to generate insights.</p>
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>Recent Meetings</h3>
          <Link href="/meetings" style={{ fontSize: "0.9rem", color: "var(--primary)", textDecoration: "none" }}>View all</Link>
        </div>

        <div className="grid">
          {/* Placeholder for when there are no meetings */}
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px" }}>
            <p style={{ margin: 0, opacity: 0.7 }}>No meetings recorded yet.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
