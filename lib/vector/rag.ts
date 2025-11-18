import { getDefaultProvider } from '../ai/providers/factory';
import { prisma } from '../db/prisma';
import * as pinecone from './pinecone';
import * as chroma from './chroma';

const USE_PINECONE = !!process.env.PINECONE_API_KEY;
const vectorDB = USE_PINECONE ? pinecone : chroma;

export async function addToRAG(
  userId: string,
  content: string,
  metadata: {
    source: string;
    sourceId?: string;
    category?: string;
  }
) {
  try {
    const provider = getDefaultProvider();
    const embeddingResponse = await provider.embeddings(content);
    const embedding = Array.isArray(embeddingResponse)
      ? embeddingResponse[0].embedding
      : embeddingResponse.embedding;

    const vectorId = await vectorDB.addEmbedding(
      userId,
      content,
      embedding,
      metadata
    );

    // Save reference in database
    await prisma.embedding.create({
      data: {
        userId,
        content,
        vectorId,
        metadata: metadata as any,
        source: metadata.source,
        sourceId: metadata.sourceId,
      },
    });

    return vectorId;
  } catch (error) {
    console.error('RAG add error:', error);
    throw error;
  }
}

export async function searchRAG(
  userId: string,
  query: string,
  topK: number = 5,
  filter?: Record<string, any>
) {
  try {
    const provider = getDefaultProvider();
    const embeddingResponse = await provider.embeddings(query);
    const queryEmbedding = Array.isArray(embeddingResponse)
      ? embeddingResponse[0].embedding
      : embeddingResponse.embedding;

    return await vectorDB.searchEmbeddings(
      userId,
      queryEmbedding,
      topK,
      filter
    );
  } catch (error) {
    console.error('RAG search error:', error);
    return [];
  }
}

export async function augmentPrompt(
  userId: string,
  query: string,
  systemPrompt: string
): Promise<string> {
  const relevantContext = await searchRAG(userId, query, 5);

  if (relevantContext.length === 0) {
    return systemPrompt;
  }

  const context = relevantContext
    .map((r, i) => `[${i + 1}] ${r.content}`)
    .join('\n\n');

  return `${systemPrompt}

CONTEXTO RELEVANTE DEL HISTORIAL DEL PACIENTE:
${context}`;
}

export async function deleteUserRAG(userId: string) {
  try {
    // Delete from vector DB
    await vectorDB.deleteUserEmbeddings(userId);

    // Delete from database
    await prisma.embedding.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error('Error deleting user RAG:', error);
    throw error;
  }
}
