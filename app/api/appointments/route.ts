import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const appointmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dateTime: z.string().or(z.date()).transform((val) => new Date(val)),
  location: z.string().optional(),
  doctorName: z.string().optional(),
});

// GET - Retrieve all appointments for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { dateTime: 'asc' },
    });

    return NextResponse.json({
      appointments: appointments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        dateTime: a.dateTime,
        location: a.location,
        doctorName: a.doctorName,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validatedData = appointmentSchema.parse(body);

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        title: validatedData.title,
        description: validatedData.description,
        dateTime: validatedData.dateTime,
        location: validatedData.location,
        doctorName: validatedData.doctorName,
        status: 'SCHEDULED',
      },
    });

    // Create reminder 24 hours before appointment
    const reminderDate = new Date(validatedData.dateTime);
    reminderDate.setHours(reminderDate.getHours() - 24);

    await prisma.reminder.create({
      data: {
        userId,
        title: `Recordatorio: ${validatedData.title}`,
        description: `Tienes una cita mañana a las ${validatedData.dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
        reminderType: 'APPOINTMENT',
        scheduledFor: reminderDate,
        frequency: 'ONCE',
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'Cita creada',
      appointment: {
        id: appointment.id,
        title: appointment.title,
        dateTime: appointment.dateTime,
      },
    });
  } catch (error) {
    console.error('Appointment POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear cita' },
      { status: 500 }
    );
  }
}
