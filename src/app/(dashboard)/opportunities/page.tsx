
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { OpportunityCard } from "@/components/OpportunityCard";
import { FolderKanban } from "lucide-react";

export default async function OpportunitiesPage() {
    const session = await auth();
    const supabase = await createClient();

    let query = supabase
        .from("opportunities")
        .select(`
            *,
            insights (id, meeting_id)
        `)
        .eq('status', 'active');

    if (session?.user?.id && !session.user.email?.includes('test')) {
        query = query.eq('user_id', session.user.id);
    }

    const { data: opportunities, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching opportunities:", error);
    }

    return (
        <div>
            <header className="header" style={{ marginBottom: "20px" }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Product Roadmap <span style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 'normal', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px' }}>Automated clustering</span>
                    </h2>
                    <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>AI-clustered opportunities based on recurring root causes across meetings.</p>
                </div>
            </header>

            {opportunities && opportunities.length > 0 ? (
                <div className="grid">
                    {opportunities.map((opp) => (
                        <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                </div>
            ) : (
                <div className="card" style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ opacity: 0.3, marginBottom: "20px" }}>
                        <FolderKanban size={64} />
                    </div>
                    <h3>Exploring your roadmap...</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto 20px', opacity: 0.7 }}>
                        KodaSync AI needs more meeting data to detect high-confidence opportunities.
                        Add more interview transcripts to see the magic happen!
                    </p>
                </div>
            )}
        </div>
    );
}
