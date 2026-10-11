'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { z } from 'zod'
import { sendWaitlistConfirmation } from '@/lib/email'

const meetingSchema = z.object({
    transcript: z.string().optional(),
    summary: z.string().optional(),
    video_url: z.string().url().optional().or(z.literal('')),
})

const insightSchema = z.object({
    meeting_id: z.string().uuid(),
    issue: z.string().min(1),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    jira_ticket_id: z.string().optional(),
    status: z.enum(['open', 'resolved']),
})

export async function createMeeting(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error('User not authenticated')
    }

    const rawFormData = {
        transcript: formData.get('transcript'),
        summary: formData.get('summary'),
        video_url: formData.get('video_url'),
    }

    const validatedFields = meetingSchema.safeParse(rawFormData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const supabase = await createClient()
    const { data: meeting, error } = await supabase.from('meetings').insert({
        user_id: session.user.email,
        ...validatedFields.data,
    }).select().single()

    if (error) {
        console.error('Error creating meeting:', error)
        return { message: 'Database Error: Failed to Create Meeting' }
    }

    // Trigger Inngest background job
    const { inngest } = await import('@/lib/inngest/client')
    await inngest.send({
        name: 'meetings.created',
        data: {
            meetingId: meeting.id,
            transcript: meeting.transcript,
        },
    })

    revalidatePath('/meetings')
    redirect('/meetings')
}

export async function createInsight(formData: FormData) {
    const session = await auth()
    if (!session?.user) {
        throw new Error('User not authenticated')
    }

    const rawFormData = {
        meeting_id: formData.get('meeting_id'),
        issue: formData.get('issue'),
        severity: formData.get('severity'),
        jira_ticket_id: formData.get('jira_ticket_id'),
        status: formData.get('status') || 'open',
    }

    const validatedFields = insightSchema.safeParse(rawFormData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const supabase = await createClient()
    const { error } = await supabase.from('insights').insert(validatedFields.data)

    if (error) {
        console.error('Error creating insight:', error)
        return { message: 'Database Error: Failed to Create Insight' }
    }

    revalidatePath(`/meetings/${validatedFields.data.meeting_id}`)
    revalidatePath('/insights')
    // We don't redirect here, just refresh data usually
}

const waitlistSchema = z.object({
    email: z.string().email(),
})

export async function joinWaitlist(formData: FormData) {
    const email = formData.get('email') as string

    const validatedFields = waitlistSchema.safeParse({ email })

    if (!validatedFields.success) {
        return {
            error: 'Invalid email address',
        }
    }

    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.from('waitlist').insert({
        email: validatedFields.data.email,
    })

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { message: 'You are already on the waitlist!' }
        }
        console.error('Error joining waitlist:', error)
        return { error: 'Failed to join waitlist. Please try again.' }
    }

    // Send confirmation emails directly via Resend (from onboarding@kodasync.app)
    try {
        await sendWaitlistConfirmation(validatedFields.data.email)
    } catch (emailError) {
        console.error('Error sending waitlist confirmation email:', emailError)
    }

    // Optionally dispatch Inngest event if background workers are active
    try {
        const { inngest } = await import('@/lib/inngest/client')
        await inngest.send({
            name: 'user/waitlist.joined',
            data: {
                email: validatedFields.data.email,
            },
        })
    } catch (inngestError) {
        // Safe fallback if Inngest keys are not configured in environment
        console.warn('Inngest event dispatch skipped:', inngestError)
    }

    return { success: true }
}

