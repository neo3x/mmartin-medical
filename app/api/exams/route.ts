import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { uploadUserFile } from '@/lib/storage/s3';
import { analyzeMedicalExam } from '@/lib/pdf/analyzer';
import { addToRAG } from '@/lib/vector/rag';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const examType = formData.get('examType') as string;
    const examName = formData.get('examName') as string;
    const examDate = formData.get('examDate') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande (máximo 10MB)' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to storage
    const { key, url } = await uploadUserFile(
      userId,
      buffer,
      file.name,
      file.type,
      'exam'
    );

    // Get user profile for context
    const userProfile = await prisma.medicalProfile.findUnique({
      where: { userId },
    });

    // Analyze exam
    const analysis = await analyzeMedicalExam(buffer, {
      age: userProfile?.dateOfBirth
        ? new Date().getFullYear() -
          new Date(userProfile.dateOfBirth).getFullYear()
        : undefined,
      gender: userProfile?.gender || undefined,
      conditions: userProfile?.chronicConditions || [],
      medications: userProfile?.currentMedications || [],
    });

    // Extract normal values from findings
    const normalValues = analysis.findings
      .filter((f) => f.status === 'normal')
      .map((f) => ({
        parameter: f.parameter,
        value: f.value,
        normalRange: f.normalRange,
      }));

    // Save to database
    const examResult = await prisma.examResult.create({
      data: {
        userId,
        type: examType as any,
        name: examName,
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
        rawText: analysis.rawText,
        interpretation: analysis.interpretation,
        findings: analysis.findings as any,
        recommendations: analysis.recommendations,
        hasCriticalValues: analysis.criticalValues.length > 0,
        criticalValues: analysis.criticalValues as any,
        normalValues: normalValues as any,
        examDate: examDate ? new Date(examDate) : null,
      },
    });

    // Add to RAG
    await addToRAG(
      userId,
      `Examen: ${examName}\n\nInterpretación: ${analysis.interpretation}`,
      {
        source: 'exam',
        sourceId: examResult.id,
        category: 'medical_exam',
      }
    );

    return NextResponse.json({
      examId: examResult.id,
      analysis,
    });
  } catch (error) {
    console.error('Exam upload error:', error);
    return NextResponse.json(
      { error: 'Error al procesar examen' },
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
    const exams = await prisma.examResult.findMany({
      where: { userId },
      orderBy: { analyzedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Get exams error:', error);
    return NextResponse.json(
      { error: 'Error al obtener exámenes' },
      { status: 500 }
    );
  }
}
