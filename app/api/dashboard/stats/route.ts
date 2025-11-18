import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';

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

    // Get stats
    const [totalChats, totalExams, upcomingAppointments, activeReminders] =
      await Promise.all([
        prisma.chatSession.count({
          where: { userId: user.id },
        }),
        prisma.examResult.count({
          where: { userId: user.id },
        }),
        prisma.appointment.count({
          where: {
            userId: user.id,
            dateTime: {
              gte: new Date(),
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
          },
        }),
        prisma.reminder.count({
          where: {
            userId: user.id,
            isActive: true,
          },
        }),
      ]);

    // Get recent activity
    const [recentChats, recentExams, recentAppointments] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          updatedAt: true,
          messageCount: true,
        },
      }),
      prisma.examResult.findMany({
        where: { userId: user.id },
        orderBy: { uploadedAt: 'desc' },
        take: 2,
        select: {
          id: true,
          examName: true,
          examType: true,
          uploadedAt: true,
        },
      }),
      prisma.appointment.findMany({
        where: {
          userId: user.id,
          dateTime: {
            gte: new Date(),
          },
        },
        orderBy: { dateTime: 'asc' },
        take: 2,
        select: {
          id: true,
          title: true,
          dateTime: true,
          location: true,
        },
      }),
    ]);

    // Format recent activity
    const recentActivity = [
      ...recentChats.map((chat) => ({
        id: chat.id,
        type: 'chat' as const,
        title: chat.title || 'Nueva Consulta',
        description: `${chat.messageCount} mensajes`,
        timestamp: chat.updatedAt,
      })),
      ...recentExams.map((exam) => ({
        id: exam.id,
        type: 'exam' as const,
        title: exam.examName,
        description: exam.examType,
        timestamp: exam.uploadedAt,
      })),
      ...recentAppointments.map((apt) => ({
        id: apt.id,
        type: 'appointment' as const,
        title: apt.title,
        description: apt.location || 'Sin ubicación',
        timestamp: apt.dateTime,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalChats,
        totalExams,
        upcomingAppointments,
        activeReminders,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
