import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    const exam = await prisma.examResult.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Examen no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exam: {
        id: exam.id,
        name: exam.name,
        type: exam.type,
        analyzedAt: exam.analyzedAt,
        fileUrl: exam.fileUrl,
        rawText: exam.rawText,
        interpretation: exam.interpretation,
        findings: exam.findings,
        recommendations: exam.recommendations,
        criticalValues: exam.criticalValues,
        normalValues: exam.normalValues,
        hasCriticalValues: exam.hasCriticalValues,
      },
    });
  } catch (error) {
    console.error('Exam detail error:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del examen' },
      { status: 500 }
    );
  }
}
