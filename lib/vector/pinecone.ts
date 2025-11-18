import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const indexName = process.env.PINECONE_INDEX || 'martin-medical';
const index = pinecone.index(indexName);

export async function addEmbedding(
  userId: string,
  content: string,
  embedding: number[],
  metadata: Record<string, any>
) {
  const vectorId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await index.upsert([
    {
      id: vectorId,
      values: embedding,
      metadata: {
        userId,
        content,
        ...metadata,
        timestamp: Date.now(),
      },
    },
  ]);

  return vectorId;
}

export async function searchEmbeddings(
  userId: string,
  queryEmbedding: number[],
  topK: number = 5,
  filter?: Record<string, any>
) {
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    filter: {
      userId,
      ...filter,
    },
    includeMetadata: true,
  });

  return results.matches.map((match) => ({
    id: match.id,
    score: match.score || 0,
    content: match.metadata?.content as string,
    metadata: match.metadata,
  }));
}

export async function deleteEmbeddings(vectorIds: string[]) {
  await index.deleteMany(vectorIds);
}

export async function deleteUserEmbeddings(userId: string) {
  await index.deleteMany({
    filter: { userId },
  });
}
