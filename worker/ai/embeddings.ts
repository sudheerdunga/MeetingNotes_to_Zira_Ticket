
let embedder: ((text: string, options?: { pooling: string; normalize: boolean }) => Promise<{ data: ArrayLike<number> }>) | null = null;

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!embedder) {
        // Dynamic import to prevent heavy bundling on every route
        const { pipeline } = await import('@xenova/transformers');
        embedder = (await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')) as ((text: string, options?: { pooling: string; normalize: boolean }) => Promise<{ data: ArrayLike<number> }>);
    }

    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}
