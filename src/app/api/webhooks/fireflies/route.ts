
import { NextResponse } from 'next/server';
import { getTranscriptById, formatTranscript } from '@/services/fireflies';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        console.log('📥 Received Fireflies Webhook:', JSON.stringify(payload, null, 2));

        // Fireflies webhook sends: eventType, transcriptId/meetingId, and organizer info
        const { eventType, transcriptId, meetingId, organizer_email } = payload;
        const id = transcriptId || meetingId;

        if (!id) {
            console.error('❌ No transcript ID found in payload');
            return NextResponse.json({ error: 'No transcript ID found in payload' }, { status: 400 });
        }

        console.log(`🔍 Fetching transcript ${id} from Fireflies...`);

        // Fetch the full transcript from Fireflies
        const transcriptData = await getTranscriptById(id);

        if (!transcriptData) {
            console.error(`❌ Transcript ${id} not found in Fireflies`);
            return NextResponse.json({ error: 'Transcript not found in Fireflies' }, { status: 404 });
        }

        console.log(`✅ Retrieved transcript: "${transcriptData.title}"`);

        const formattedTranscript = formatTranscript(transcriptData);

        // Use service role client to bypass RLS
        const supabase = createServiceClient();

        // User Association Strategy:
        // 1. If organizer_email is provided, try to find matching user
        // 2. For now, we'll use a system user as fallback
        // 3. TODO: Implement proper user lookup via NextAuth User table or create a mapping table
        let userId: string | null = null;

        if (organizer_email) {
            console.log(`🔍 Looking up user by email: ${organizer_email}`);

            // Since NextAuth doesn't expose a direct user lookup by email in the default setup,
            // we'll need to either:
            // A) Create a user mapping table in Supabase
            // B) Use the first authenticated user for testing
            // C) Use a system user (current approach)

            // For production, you should create a user_mappings table:
            // CREATE TABLE user_mappings (
            //   email text primary key,
            //   user_id text not null
            // );

            // Then query it here:
            // const { data: mapping } = await supabase
            //   .from('user_mappings')
            //   .select('user_id')
            //   .eq('email', organizer_email)
            //   .single();

            console.warn(`⚠️ User lookup not yet implemented. Using system user.`);
        }

        // Use system user for webhook imports
        // This allows meetings to be imported and later associated with users
        if (!userId) {
            console.log('⚠️ Using system user for Fireflies import');
            userId = 'system-fireflies-import';
        }

        console.log(`💾 Inserting meeting into database for user: ${userId}`);

        // Inserting into meetings table using service role (bypasses RLS)
        const { data: meeting, error } = await supabase.from('meetings').insert({
            user_id: userId,
            transcript: formattedTranscript,
            summary: transcriptData.title,
            video_url: transcriptData.transcript_url,
        }).select().single();

        if (error) {
            console.error('❌ Supabase Error:', error);
            return NextResponse.json({
                error: 'Failed to store meeting',
                details: error.message
            }, { status: 500 });
        }

        console.log(`✅ Meeting created with ID: ${meeting.id}`);

        // Trigger Inngest background job for AI processing
        console.log('🚀 Triggering Inngest job for UX insights processing...');
        const { inngest } = await import('@/lib/inngest/client');
        await inngest.send({
            name: 'meetings.created',
            data: {
                meetingId: meeting.id,
                transcript: meeting.transcript,
            },
        });

        console.log('✅ Webhook processing complete');

        return NextResponse.json({
            success: true,
            id,
            meetingId: meeting.id,
            message: 'Meeting imported and queued for analysis'
        });
    } catch (error: any) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
