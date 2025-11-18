import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { getDefaultProvider } from '@/lib/ai/providers/factory';
import { augmentPrompt } from '@/lib/vector/rag';
import { getSystemPrompt, buildContextualPrompt } from '@/lib/ai/prompts';

const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { message, sessionId } = chatSchema.parse(body);

    // Similar setup as non-streaming chat
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

    const userProfile = await prisma.medicalProfile.findUnique({
      where: { userId },
    });

    const baseSystemPrompt = getSystemPrompt(
      'medical_assistant',
      session.user.technicalLevel as any
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

    const finalSystemPrompt = await augmentPrompt(
      userId,
      message,
      baseSystemPrompt + contextualPrompt
    );

    const conversationHistory = chatSession.messages
      .reverse()
      .map((m) => ({
        role: m.role.toLowerCase() as 'user' | 'assistant',
        content: m.content,
      }));

    const provider = getDefaultProvider();
    const messages = [
      { role: 'system' as const, content: finalSystemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ];

    // Save user message immediately
    await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        role: 'USER',
        content: message,
      },
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          for await (const chunk of provider.chatStream(messages, {
            temperature: 0.7,
            maxTokens: 1024,
          })) {
            if (!chunk.done) {
              fullResponse += chunk.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            }
          }

          // Save assistant message
          await prisma.message.create({
            data: {
              sessionId: chatSession!.id,
              role: 'ASSISTANT',
              content: fullResponse,
            },
          });

          // Update session
          await prisma.chatSession.update({
            where: { id: chatSession!.id },
            data: {
              messageCount: { increment: 2 },
              lastMessageAt: new Date(),
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, sessionId: chatSession!.id })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream chat error:', error);
    return new Response('Error', { status: 500 });
  }
}
