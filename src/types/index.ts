
export interface Meeting {
    id: string
    user_id: string
    transcript: string | null
    summary: string | null
    video_url: string | null
    created_at: string
}

export interface Insight {
    id: string
    meeting_id: string
    issue: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    jira_ticket_id: string | null
    status: 'open' | 'resolved'
    resolved_at?: string | null
    created_at: string
}
