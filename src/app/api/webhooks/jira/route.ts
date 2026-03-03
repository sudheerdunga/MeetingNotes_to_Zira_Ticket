
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Jira Webhook Handler
 * 
 * listens for jira:issue_updated events.
 * When an issue state moves to 'Done' or 'Resolved', 
 * we update the corresponding insight in KodaSync to 'resolved'
 * and send a real-time toast notification via Supabase Realtime.
 */

export async function GET() {
    return NextResponse.json({ message: "Jira Webhook endpoint is active and waiting for POST requests." });
}

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { webhookEvent, issue } = payload;

        console.log(`📥 Received Jira Webhook: ${webhookEvent || 'unknown'}`);

        // Only process issue update events
        if (webhookEvent === 'jira:issue_updated' || webhookEvent === 'jira:issue_created') {
            const issueKey = issue?.key;
            const statusName = issue?.fields?.status?.name;
            const eventType = payload.issue_event_type_name; // e.g. 'issue_generic' or 'issue_updated'

            console.log(`🔍 [DEBUG] Issue: ${issueKey} | Status: "${statusName}" | Event: ${webhookEvent} | Intent: ${eventType}`);

            // Broaden the status check to be case-insensitive and include 'Closed'
            const completedStatuses = ['done', 'resolved', 'closed', 'completed'];
            const normalizedStatus = statusName?.toLowerCase() || '';

            if (completedStatuses.includes(normalizedStatus)) {
                const supabase = createServiceClient();

                console.log(`✅ Status "${statusName}" recognized as completed. Resolving insight for ticket: ${issueKey}`);

                // 1. Update the Insight in Supabase
                const { data, error } = await supabase
                    .from('insights')
                    .update({
                        status: 'resolved',
                        resolved_at: new Date().toISOString()
                    })
                    .eq('jira_ticket_id', issueKey)
                    .select();

                if (error) {
                    console.error('❌ Supabase Update Error:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }

                if (data && data.length > 0) {
                    console.log(`🚀 Successfully marked ${data.length} insight(s) as resolved.`);

                    // 2. Broadcast a "toast" notification via Supabase Realtime
                    // Any frontend client listening on the 'jira-events' channel will see this
                    const channel = supabase.channel('jira-events');
                    await channel.send({
                        type: 'broadcast',
                        event: 'toast',
                        payload: {
                            message: `Jira Issue ${issueKey} is now DONE!`,
                            description: `The corresponding insight has been automatically resolved.`,
                            type: 'success',
                            issueKey: issueKey,
                            insightIds: data.map(i => i.id)
                        }
                    });

                    console.log('📡 Broadcast notification sent via Supabase Realtime.');
                } else {
                    console.warn(`⚠️ Webhook received for ticket "${issueKey}", but no matching insight found in database.`);
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Webhook processed' });
    } catch (error: unknown) {
        console.error('❌ Jira Webhook Critical Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
