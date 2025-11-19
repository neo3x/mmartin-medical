import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { TechnicalLevel } from '@prisma/client';
import { getDefaultProvider } from '@/lib/ai/providers/factory';
import { augmentPrompt } from '@/lib/vector/rag';
import { getSystemPrompt, buildContextualPrompt } from '@/lib/ai/prompts';
import { addToRAG } from '@/lib/vector/rag';
import { rateLimitCheck } from '@/lib/cache/redis';

const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limiting
    const rateLimit = await rateLimitCheck(userId, 'chat', 20, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { message, sessionId } = chatSchema.parse(body);

    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId },
        include: {
          messages: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
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

    // Get user profile for context
    const userProfile = await prisma.medicalProfile.findUnique({
      where: { userId },
    });

    // Build system prompt
    const baseSystemPrompt = getSystemPrompt(
      'medical_assistant',
      (session.user.technicalLevel as TechnicalLevel) || 'MODERATE'
    );

    const contextualPrompt = buildContextualPrompt({
      age: userProfile?.dateOfBirth
        ? new Date().getFullYear() -
          new Date(userProfile.dateOfBirth).getFullYear()
        : undefined,
      gender: userProfile?.gender || undefined,
      conditions: userProfile?.chronicConditions || [],
      allergies: userProfile?.allergies || [],
      medications: userProfile?.currentMedications || [],
    });

    // Augment with RAG context
    const finalSystemPrompt = await augmentPrompt(
      userId,
      message,
      baseSystemPrompt + contextualPrompt
    );

    // Build conversation history
    const conversationHistory = chatSession.messages
      .reverse()
      .map((m) => ({
        role: m.role.toLowerCase() as 'user' | 'assistant',
        content: m.content,
      }));

    // Get AI response
    const provider = getDefaultProvider();
    const messages = [
      { role: 'system' as const, content: finalSystemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ];

    const response = await provider.chat(messages, {
      temperature: 0.7,
      maxTokens: 1024,
    });

    // Save messages in transaction
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

    // Update session stats
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        messageCount: { increment: 2 },
        totalTokens: { increment: response.usage?.totalTokens || 0 },
        lastMessageAt: new Date(),
      },
    });

    // Add to RAG (async, don't wait)
    addToRAG(userId, `Q: ${message}\nA: ${response.content}`, {
      source: 'chat',
      sourceId: chatSession.id,
      category: 'conversation',
    }).catch((err) => console.error('RAG add error:', err));

    return NextResponse.json({
      sessionId: chatSession.id,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Error al procesar mensaje' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all chat sessions for user
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesiones' },
      { status: 500 }
    );
  }
}
