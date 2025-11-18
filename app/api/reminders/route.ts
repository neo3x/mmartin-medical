import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const reminderSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  reminderType: z.enum(['MEDICATION', 'APPOINTMENT', 'MEASUREMENT', 'GENERAL']),
  scheduledFor: z.string().or(z.date()).transform((val) => new Date(val)),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
});

// GET - Retrieve all reminders for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      orderBy: { scheduledFor: 'asc' },
    });

    return NextResponse.json({
      reminders: reminders.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        reminderType: r.reminderType,
        scheduledFor: r.scheduledFor,
        frequency: r.frequency,
        isActive: r.isActive,
        isCompleted: r.isCompleted,
        completedAt: r.completedAt,
      })),
    });
  } catch (error) {
    console.error('Reminders GET error:', error);
    return NextResponse.json(
      { error: 'Error al obtener recordatorios' },
      { status: 500 }
    );
  }
}

// POST - Create new reminder
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = reminderSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        description: validatedData.description,
        reminderType: validatedData.reminderType,
        scheduledFor: validatedData.scheduledFor,
        frequency: validatedData.frequency || 'ONCE',
        isActive: true,
      },
    });

    // Create notification for upcoming reminder
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Recordatorio: ${validatedData.title}`,
        message: validatedData.description || 'Tienes un recordatorio pendiente',
        type: 'REMINDER',
        relatedEntityId: reminder.id,
      },
    });

    return NextResponse.json({
      message: 'Recordatorio creado',
      reminder: {
        id: reminder.id,
        title: reminder.title,
        scheduledFor: reminder.scheduledFor,
      },
    });
  } catch (error) {
    console.error('Reminder POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear recordatorio' },
      { status: 500 }
    );
  }
}
