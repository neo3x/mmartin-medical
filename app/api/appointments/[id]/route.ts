import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';

// DELETE - Delete appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Cita eliminada',
    });
  } catch (error) {
    console.error('Appointment DELETE error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar cita' },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json();

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: body.status || appointment.status,
      },
    });

    return NextResponse.json({
      message: 'Cita actualizada',
      appointment: updated,
    });
  } catch (error) {
    console.error('Appointment PATCH error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cita' },
      { status: 500 }
    );
  }
}
