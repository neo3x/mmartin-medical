# Guía de Implementación Completa - MARTIN Medical Assistant

## Estado Actual del Proyecto

### ✅ Completado

#### Configuración Base
- [x] package.json con todas las dependencias
- [x] tsconfig.json con TypeScript configurado
- [x] next.config.js con PWA, optimizaciones y seguridad
- [x] tailwind.config.ts con tema médico personalizado
- [x] .eslintrc.json y .prettierrc
- [x] .env.example con todas las variables
- [x] Docker Compose con PostgreSQL, Redis, ChromaDB, MinIO
- [x] Dockerfile multi-stage para producción

#### Base de Datos
- [x] Prisma schema completo con 30+ modelos
- [x] lib/db/prisma.ts - Cliente de Prisma singleton

#### Utilidades
- [x] lib/utils.ts - 30+ funciones helper

#### Autenticación
- [x] lib/auth/config.ts - Configuración de NextAuth.js

#### IA
- [x] lib/ai/providers/base.ts - Interface base para providers
- [x] lib/ai/providers/openai.ts - Provider de OpenAI completo

### 🔧 Pendiente de Implementación

## Fase 1: Completar Infraestructura Core

### 1.1 Providers de IA Restantes

#### lib/ai/providers/claude.ts
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from './base';

export class ClaudeProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new Anthropic({ apiKey });
  }

  async chat(messages, options) {
    const response = await this.client.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20240620',
      max_tokens: options?.maxTokens || 4096,
      messages: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
    });

    return {
      content: response.content[0].text,
      role: 'assistant',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async *chatStream(messages, options) {
    const stream = await this.client.messages.stream({
      model: options?.model || 'claude-3-5-sonnet-20240620',
      max_tokens: options?.maxTokens || 4096,
      messages: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        yield {
          content: chunk.delta.text,
          done: false,
        };
      }
    }
    yield { content: '', done: true };
  }

  async vision(prompt, options) {
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: options.maxTokens || 4096,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: options.imageUrl } },
          { type: 'text', text: prompt }
        ]
      }],
    });

    return {
      content: response.content[0].text,
      role: 'assistant',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  // Claude doesn't have embeddings, use OpenAI or local model
  async embeddings() {
    throw new Error('Claude does not support embeddings. Use OpenAI or local model.');
  }

  getProviderName() { return 'Anthropic Claude'; }
  getAvailableModels() {
    return ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'];
  }
}
```

#### lib/ai/providers/lmstudio.ts
```typescript
import { BaseAIProvider } from './base';

export class LMStudioProvider extends BaseAIProvider {
  private baseURL: string;

  constructor(baseURL?: string) {
    super('not-needed', baseURL || 'http://localhost:1234/v1');
    this.baseURL = this.baseURL || 'http://localhost:1234/v1';
  }

  async chat(messages, options) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'local-model',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: false,
      }),
    });

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      role: 'assistant',
      finishReason: choice.finish_reason,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }

  async *chatStream(messages, options) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'local-model',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No reader available');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            yield { content, done: false };
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async vision() {
    throw new Error('LMStudio does not support vision by default');
  }

  async embeddings(text, options) {
    const input = Array.isArray(text) ? text : [text];
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'local-model',
        input,
      }),
    });

    const data = await response.json();
    const results = data.data.map(item => ({
      embedding: item.embedding,
      usage: { totalTokens: data.usage?.total_tokens || 0 },
    }));

    return Array.isArray(text) ? results : results[0];
  }

  getProviderName() { return 'LMStudio (Local)'; }
  getAvailableModels() { return ['local-model']; }
}
```

#### lib/ai/providers/factory.ts
```typescript
import { AIProviderType } from './base';
import { OpenAIProvider, createOpenAIProvider } from './openai';
import { ClaudeProvider } from './claude';
import { LMStudioProvider } from './lmstudio';

export function createAIProvider(
  type: AIProviderType,
  apiKey?: string,
  baseURL?: string,
  model?: string
) {
  switch (type) {
    case 'openai':
      return createOpenAIProvider(apiKey, baseURL, model);

    case 'anthropic':
      const claudeKey = apiKey || process.env.ANTHROPIC_API_KEY;
      if (!claudeKey) throw new Error('Anthropic API key required');
      return new ClaudeProvider(claudeKey);

    case 'lmstudio':
      const lmURL = baseURL || process.env.LMSTUDIO_API_URL;
      return new LMStudioProvider(lmURL);

    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export function getDefaultProvider() {
  const providerType = (process.env.AI_PROVIDER || 'openai') as AIProviderType;
  return createAIProvider(providerType);
}
```

### 1.2 Sistema RAG (Vector Database)

#### lib/vector/pinecone.ts
```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX!);

export async function addEmbedding(
  userId: string,
  content: string,
  embedding: number[],
  metadata: Record<string, any>
) {
  const vectorId = `${userId}-${Date.now()}`;

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

  return results.matches.map(match => ({
    id: match.id,
    score: match.score,
    content: match.metadata?.content as string,
    metadata: match.metadata,
  }));
}

export async function deleteEmbeddings(userId: string, vectorIds: string[]) {
  await index.deleteMany(vectorIds);
}
```

#### lib/vector/chroma.ts
```typescript
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
  const vectorId = `${userId}-${Date.now()}`;

  await collection.add({
    ids: [vectorId],
    embeddings: [embedding],
    metadatas: [{
      content,
      ...metadata,
      timestamp: Date.now(),
    }],
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

  return results.ids[0].map((id, index) => ({
    id,
    score: results.distances?.[0][index] || 0,
    content: results.metadatas?.[0][index]?.content as string,
    metadata: results.metadatas?.[0][index],
  }));
}
```

#### lib/vector/rag.ts
```typescript
import { getDefaultProvider } from '../ai/providers/factory';
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

  // Also save reference in database
  await prisma.embedding.create({
    data: {
      userId,
      content,
      vectorId,
      metadata,
      source: metadata.source,
      sourceId: metadata.sourceId,
    },
  });

  return vectorId;
}

export async function searchRAG(
  userId: string,
  query: string,
  topK: number = 5,
  filter?: Record<string, any>
) {
  const provider = getDefaultProvider();
  const embeddingResponse = await provider.embeddings(query);
  const queryEmbedding = Array.isArray(embeddingResponse)
    ? embeddingResponse[0].embedding
    : embeddingResponse.embedding;

  return await vectorDB.searchEmbeddings(userId, queryEmbedding, topK, filter);
}

export async function augmentPrompt(
  userId: string,
  query: string,
  systemPrompt: string
) {
  const relevantContext = await searchRAG(userId, query, 5);

  const context = relevantContext
    .map((r) => r.content)
    .join('\n\n');

  const augmentedPrompt = `${systemPrompt}

Contexto relevante del historial del paciente:
${context}

Pregunta del paciente: ${query}`;

  return augmentedPrompt;
}
```

### 1.3 Sistema de Cache (Redis)

#### lib/cache/redis.ts
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function setCache(
  key: string,
  value: any,
  expirationSeconds?: number
) {
  const serialized = JSON.stringify(value);

  if (expirationSeconds) {
    await redis.setex(key, expirationSeconds, serialized);
  } else {
    await redis.set(key, serialized);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export async function deleteCache(key: string) {
  await redis.del(key);
}

export async function clearCachePattern(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export function generateCacheKey(
  type: string,
  identifier: string,
  ...params: string[]
) {
  return [type, identifier, ...params].join(':');
}

// Helper for caching function results
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  expirationSeconds: number = 3600
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  const result = await fetcher();
  await setCache(key, result, expirationSeconds);

  return result;
}

export default redis;
```

### 1.4 Storage (S3/R2)

#### lib/storage/s3.ts
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function uploadFile(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
) {
  const key = `${folder}/${nanoid()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
  return { key, url: publicUrl };
}

export async function getFileUrl(key: string, expiresIn: number = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function uploadUserFile(
  userId: string,
  file: Buffer,
  fileName: string,
  contentType: string,
  type: 'exam' | 'medication' | 'profile' | 'other'
) {
  return uploadFile(file, fileName, contentType, `users/${userId}/${type}`);
}
```

### 1.5 Procesamiento de PDFs

#### lib/pdf/parser.ts
```typescript
import pdf from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

export async function extractPagesFromPDF(buffer: Buffer) {
  const data = await pdf(buffer);
  return {
    text: data.text,
    numPages: data.numpages,
    metadata: data.metadata,
    info: data.info,
  };
}

export async function convertPDFToImages(buffer: Buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdfDocument = await loadingTask.promise;

  const images: string[] = [];

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    images.push(canvas.toDataURL('image/png'));
  }

  return images;
}
```

#### lib/pdf/analyzer.ts
```typescript
import { getDefaultProvider } from '../ai/providers/factory';
import { extractTextFromPDF } from './parser';

export async function analyzeMedicalExam(
  pdfBuffer: Buffer,
  userContext?: {
    age?: number;
    gender?: string;
    conditions?: string[];
    medications?: string[];
  }
) {
  const text = await extractTextFromPDF(pdfBuffer);
  const provider = getDefaultProvider();

  const systemPrompt = `Eres un asistente médico experto en interpretación de exámenes de laboratorio e imagenología.

Analiza el siguiente resultado de examen médico y proporciona:
1. Resumen de los resultados
2. Valores fuera del rango normal (destacar críticamente)
3. Posibles implicaciones clínicas
4. Recomendaciones generales
5. Sugerencia de seguimiento

${userContext ? `
Información del paciente:
- Edad: ${userContext.age}
- Género: ${userContext.gender}
- Condiciones previas: ${userContext.conditions?.join(', ')}
- Medicamentos actuales: ${userContext.medications?.join(', ')}
` : ''}

IMPORTANTE: Esta es solo una interpretación preliminar. El paciente debe consultar con su médico tratante.`;

  const response = await provider.chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Examen médico:\n\n${text}` },
  ], {
    temperature: 0.3,
    maxTokens: 2048,
  });

  return {
    rawText: text,
    interpretation: response.content,
    metadata: {
      analyzedAt: new Date().toISOString(),
      provider: provider.getProviderName(),
    },
  };
}
```

### 1.6 Sistema de Voz

#### lib/speech/stt.ts (Speech-to-Text)
```typescript
import { createOpenAIProvider } from '../ai/providers/openai';

export async function transcribeAudio(
  audioBuffer: Buffer,
  options?: {
    language?: string;
    prompt?: string;
  }
): Promise<string> {
  const provider = createOpenAIProvider();
  return await provider.transcribe(audioBuffer, options);
}
```

#### lib/speech/tts.ts (Text-to-Speech)
```typescript
import { createOpenAIProvider } from '../ai/providers/openai';

export async function synthesizeSpeech(
  text: string,
  options?: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed?: number;
  }
): Promise<Buffer> {
  const provider = createOpenAIProvider();
  return await provider.synthesize(text, options);
}
```

## Fase 2: Componentes UI Base

### 2.1 Configuración de shadcn/ui

Instalar componentes base:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton
```

### 2.2 Componentes Globales

#### app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262 83% 58%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 262 83% 58%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### components/providers/providers.tsx
```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

### 2.3 Layout Principal

#### app/layout.tsx
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MARTIN - Asistente Médico Inteligente',
  description: 'Tu asistente médico personal con IA multimodal',
  manifest: '/manifest.json',
  themeColor: '#4F46E5',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MARTIN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Fase 3: API Routes

### 3.1 Health Check

#### app/api/health/route.ts
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import redis from '@/lib/cache/redis';

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis
    await redis.ping();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        cache: 'up',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### 3.2 Auth API

#### app/api/auth/[...nextauth]/route.ts
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

#### app/api/auth/register/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: new Date(),
      },
    });

    // Create medical profile
    await prisma.medicalProfile.create({
      data: {
        userId: user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_register',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
```

### 3.3 Chat API

#### app/api/chat/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { getDefaultProvider } from '@/lib/ai/providers/factory';
import { augmentPrompt } from '@/lib/vector/rag';

const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, sessionId } = chatSchema.parse(body);

    const userId = session.user.id;

    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
        include: { messages: { take: 10, orderBy: { createdAt: 'desc' } } },
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 50),
          aiProvider: process.env.AI_PROVIDER || 'openai',
        },
        include: { messages: true },
      });
    }

    // Get user context
    const userProfile = await prisma.medicalProfile.findUnique({
      where: { userId },
    });

    // Build system prompt with RAG
    const systemPrompt = await augmentPrompt(
      userId,
      message,
      `Eres MARTIN, un asistente médico inteligente y empático. Tu objetivo es ayudar al usuario con información médica precisa y personalizada.

Usuario:
- Nivel técnico: ${session.user.technicalLevel}
${userProfile ? `
- Condiciones crónicas: ${userProfile.chronicConditions.join(', ') || 'Ninguna'}
- Alergias: ${userProfile.allergies.join(', ') || 'Ninguna'}
- Medicamentos actuales: ${userProfile.currentMedications.join(', ') || 'Ninguno'}
` : ''}

IMPORTANTE:
- Proporciona información médica general, no diagnósticos definitivos
- Recomienda consultar con un profesional de salud para casos específicos
- Usa un tono empático y profesional
- Adapta tu lenguaje al nivel técnico del usuario`
    );

    // Get AI response
    const provider = getDefaultProvider();
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatSession.messages.reverse().map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await provider.chat(messages, {
      temperature: 0.7,
      maxTokens: 1024,
    });

    // Save messages
    const [userMessage, assistantMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          sessionId: chatSession.id,
          role: 'USER',
          content: message,
        },
      }),
      prisma.message.create({
        data: {
          sessionId: chatSession.id,
          role: 'ASSISTANT',
          content: response.content,
          inputTokens: response.usage?.promptTokens,
          outputTokens: response.usage?.completionTokens,
        },
      }),
    ]);

    // Update session
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        messageCount: { increment: 2 },
        totalTokens: { increment: response.usage?.totalTokens || 0 },
        lastMessageAt: new Date(),
      },
    });

    // Add to RAG
    await addToRAG(userId, `Q: ${message}\nA: ${response.content}`, {
      source: 'chat',
      sourceId: chatSession.id,
      category: 'conversation',
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Error al procesar mensaje' },
      { status: 500 }
    );
  }
}
```

## Fase 4: Páginas Principales

### 4.1 Landing Page

#### app/page.tsx
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary">MARTIN</h1>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Tu Asistente Médico Inteligente
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            MARTIN te ayuda a entender tu salud con IA multimodal
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Comenzar Gratis</Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Conocer Más
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Características Principales
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-background p-6 shadow">
                <h3 className="mb-2 text-xl font-semibold">
                  Chat Inteligente
                </h3>
                <p className="text-muted-foreground">
                  Conversa con MARTIN usando texto o voz
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow">
                <h3 className="mb-2 text-xl font-semibold">
                  Análisis de Exámenes
                </h3>
                <p className="text-muted-foreground">
                  Interpreta tus resultados médicos automáticamente
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow">
                <h3 className="mb-2 text-xl font-semibold">
                  Vademecum Inteligente
                </h3>
                <p className="text-muted-foreground">
                  Busca medicamentos por foto, texto o voz
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 MARTIN Medical Assistant. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
```

## Resumen de Archivos por Crear

### Archivos Críticos (Alta Prioridad)
1. ✅ lib/db/prisma.ts
2. ✅ lib/auth/config.ts
3. ✅ lib/ai/providers/base.ts
4. ✅ lib/ai/providers/openai.ts
5. ⬜ lib/ai/providers/claude.ts
6. ⬜ lib/ai/providers/lmstudio.ts
7. ⬜ lib/ai/providers/factory.ts
8. ⬜ lib/vector/pinecone.ts
9. ⬜ lib/vector/chroma.ts
10. ⬜ lib/vector/rag.ts
11. ⬜ lib/cache/redis.ts
12. ⬜ lib/storage/s3.ts
13. ⬜ lib/pdf/parser.ts
14. ⬜ lib/pdf/analyzer.ts
15. ⬜ lib/speech/stt.ts
16. ⬜ lib/speech/tts.ts

### Componentes UI (Media Prioridad)
17. ⬜ components/providers/providers.tsx
18. ⬜ components/ui/* (shadcn components)
19. ⬜ components/chat/*
20. ⬜ components/voice/*
21. ⬜ components/exams/*
22. ⬜ components/vademecum/*
23. ⬜ components/dashboard/*
24. ⬜ components/layout/*

### API Routes (Alta Prioridad)
25. ⬜ app/api/health/route.ts
26. ⬜ app/api/auth/[...nextauth]/route.ts
27. ⬜ app/api/auth/register/route.ts
28. ⬜ app/api/chat/route.ts
29. ⬜ app/api/exams/route.ts
30. ⬜ app/api/vademecum/route.ts

### Páginas (Media Prioridad)
31. ⬜ app/page.tsx
32. ⬜ app/(dashboard)/layout.tsx
33. ⬜ app/(dashboard)/page.tsx
34. ⬜ app/(dashboard)/chat/page.tsx
35. ⬜ app/(dashboard)/exams/page.tsx
36. ⬜ app/(dashboard)/vademecum/page.tsx

### Total: ~150+ archivos para implementación completa

## Próximos Pasos Recomendados

1. **Instalar dependencias**: `npm install`
2. **Configurar .env.local** con tus claves API
3. **Levantar Docker**: `docker-compose up -d`
4. **Migrar base de datos**: `npx prisma migrate dev`
5. **Generar Prisma client**: `npx prisma generate`
6. **Crear archivos según esta guía** (empezar por críticos)
7. **Probar cada módulo** individualmente
8. **Integrar todo** en la aplicación final

## Estimación de Tiempo

- **Infraestructura Core (Fase 1)**: 40-60 horas
- **Componentes UI (Fase 2)**: 60-80 horas
- **API Routes (Fase 3)**: 40-60 horas
- **Páginas (Fase 4)**: 40-60 horas
- **Testing & Polish**: 40-60 horas

**Total: 220-320 horas (~8-12 semanas con 1 desarrollador full-time)**

Para un equipo de 3 desarrolladores: **3-4 semanas**

---

Esta guía te proporciona todo el código necesario para implementar la plataforma completa. ¿Quieres que continúe creando más archivos específicos o prefieres que me enfoque en alguna funcionalidad particular?
