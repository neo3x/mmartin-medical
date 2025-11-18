import { ChromaClient } from 'chromadb';

const client = new ChromaClient({
  path: process.env.CHROMA_URL || 'http://localhost:8000',
});

export async function getOrCreateCollection(name: string) {
  try {
    return await client.getOrCreateCollection({ name });
  } catch (error) {
    console.error('ChromaDB error:', error);
    throw error;
  }
}

export async function addEmbedding(
  userId: string,
  content: string,
  embedding: number[],
  metadata: Record<string, any>
) {
  const collection = await getOrCreateCollection(`user_${userId}`);
  const vectorId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await collection.add({
    ids: [vectorId],
    embeddings: [embedding],
    metadatas: [
      {
        content,
        ...metadata,
        timestamp: Date.now(),
      },
    ],
  });

  return vectorId;
}

export async function searchEmbeddings(
  userId: string,
  queryEmbedding: number[],
  topK: number = 5
) {
  const collection = await getOrCreateCollection(`user_${userId}`);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  if (!results.ids || !results.ids[0]) {
    return [];
  }

  return results.ids[0].map((id, index) => ({
    id,
    score: 1 - (results.distances?.[0]?.[index] || 0), // Convert distance to similarity
    content: (results.metadatas?.[0]?.[index] as any)?.content as string,
    metadata: results.metadatas?.[0]?.[index],
  }));
}

export async function deleteEmbeddings(userId: string, vectorIds: string[]) {
  const collection = await getOrCreateCollection(`user_${userId}`);
  await collection.delete({ ids: vectorIds });
}

export async function deleteUserEmbeddings(userId: string) {
  try {
    await client.deleteCollection({ name: `user_${userId}` });
  } catch (error) {
    // Collection might not exist
    console.warn(`Collection user_${userId} not found`);
  }
}
