export const FIREFLIES_QUERY = `
  query Transcripts($limit: Int, $organizers: [String]) {
    transcripts(limit: $limit, organizers: $organizers) {
      id
      title
      date
      sentences {
        index
        speaker_id
        speaker_name
        text
        raw_text
        start_time
        end_time
      }
      transcript_url
    }
  }
`;

export const FIREFLIES_BY_ID_QUERY = `
  query Transcript($transcriptId: String!) {
    transcript(id: $transcriptId) {
      id
      title
      date
      sentences {
        index
        speaker_id
        speaker_name
        text
        raw_text
        start_time
        end_time
      }
      transcript_url
    }
  }
`;

export interface FirefliesTranscript {
  id: string;
  title: string;
  date: string;
  sentences: {
    index: number;
    speaker_id: string;
    speaker_name: string;
    text: string;
    raw_text: string;
    start_time: number;
    end_time: number;
  }[];
  transcript_url: string;
}

export async function fetchFireflies(query: string, variables: Record<string, unknown> = {}) {
  const token = process.env.FIREFLIES_API_KEY;
  if (!token) {
    throw new Error('FIREFLIES_API_KEY is not set in environment variables');
  }

  const response = await fetch('https://api.fireflies.ai/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  if (result.errors) {
    console.error('Fireflies API Errors:', result.errors);
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

export async function getLatestTranscript(email?: string): Promise<FirefliesTranscript | null> {
  const variables: Record<string, unknown> = { limit: 1 };
  if (email) {
    variables.organizers = [email];
  }
  const data = await fetchFireflies(FIREFLIES_QUERY, variables);
  return data.transcripts?.[0] || null;
}

export async function getTranscriptById(id: string): Promise<FirefliesTranscript | null> {
  const data = await fetchFireflies(FIREFLIES_BY_ID_QUERY, { transcriptId: id });
  return data.transcript || null;
}

export function formatTranscript(transcript: FirefliesTranscript): string {
  return transcript.sentences
    .map((s) => `${s.speaker_name || s.speaker_id || 'Unknown'}: ${s.text}`)
    .join('\n');
}
