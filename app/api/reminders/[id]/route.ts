import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';

// PATCH - Update reminder (toggle active/complete)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: 'Recordatorio no encontrado' },
        { status: 404 }
      );
    }

    const updated = await prisma.reminder.update({
      where: { id: params.id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : reminder.isActive,
        isCompleted:
          body.isCompleted !== undefined ? body.isCompleted : reminder.isCompleted,
        completedAt:
          body.isCompleted === true ? new Date() : reminder.completedAt,
      },
    });

    return NextResponse.json({
      message: 'Recordatorio actualizado',
      reminder: updated,
    });
  } catch (error) {
    console.error('Reminder PATCH error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar recordatorio' },
      { status: 500 }
    );
  }
}

// DELETE - Delete reminder
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: 'Recordatorio no encontrado' },
        { status: 404 }
      );
    }

    await prisma.reminder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Recordatorio eliminado',
    });
  } catch (error) {
    console.error('Reminder DELETE error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar recordatorio' },
      { status: 500 }
    );
  }
}
