
import { Opportunity } from "@/types";
import { FolderKanban, MessageSquare, TrendingDown } from "lucide-react";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
    const insights = opportunity.insights || [];
    const uniqueMeetings = new Set(insights.map(i => i.meeting_id)).size;

    return (
        <div className="card opportunity-card" style={{
            border: '1px solid var(--primary)',
            background: 'linear-gradient(145deg, var(--card) 0%, rgba(100, 255, 218, 0.05) 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px', opacity: 0.1 }}>
                <FolderKanban size={64} />
            </div>

            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ backgroundColor: 'var(--primary)', color: 'var(--background)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Cluster Opportunity
                    </div>
                </div>
                <h3 className="card-title" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{opportunity.title}</h3>
            </div>

            <div className="card-content" style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.5', marginBottom: '15px' }}>
                    <strong>Root Cause:</strong> {opportunity.root_cause}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                        <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                        <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Evidence</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{uniqueMeetings} Meetings</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                        <TrendingDown size={16} style={{ color: '#ff4d4f' }} />
                        <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Sentiment Cost</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ff4d4f' }}>{opportunity.sentiment_impact}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                    View Cluster Details
                </button>
            </div>
        </div>
    );
}
