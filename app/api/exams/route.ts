import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { ExamType, Prisma } from '@prisma/client';
import { uploadUserFile } from '@/lib/storage/s3';
import { analyzeMedicalExam } from '@/lib/pdf/analyzer';
import { addToRAG } from '@/lib/vector/rag';
import {
  validatePDFFile,
  validatePDFBuffer,
  sanitizeFilename,
} from '@/lib/validation/file';
import { BadRequestError, formatErrorResponse } from '@/lib/errors/http';

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
      throw new BadRequestError('No se proporcionó archivo', 'FILE_REQUIRED');
    }

    // Validate PDF file
    const fileValidation = validatePDFFile(file);
    if (!fileValidation.valid && fileValidation.error) {
      throw new BadRequestError(
        fileValidation.error.message,
        fileValidation.error.code
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate buffer is actually a PDF
    const bufferValidation = validatePDFBuffer(buffer);
    if (!bufferValidation.valid && bufferValidation.error) {
      throw new BadRequestError(
        bufferValidation.error.message,
        bufferValidation.error.code
      );
    }

    // Sanitize filename
    const safeFilename = sanitizeFilename(file.name);

    // Upload to storage
    const { key, url } = await uploadUserFile(
      userId,
      buffer,
      safeFilename,
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
        type: examType as ExamType,
        name: examName,
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
        rawText: analysis.rawText,
        interpretation: analysis.interpretation,
        findings: analysis.findings as Prisma.JsonArray,
        recommendations: analysis.recommendations,
        hasCriticalValues: analysis.criticalValues.length > 0,
        criticalValues: analysis.criticalValues as Prisma.JsonArray,
        normalValues: normalValues as Prisma.JsonArray,
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

    // Handle custom HTTP errors
    if (error instanceof BadRequestError) {
      return NextResponse.json(formatErrorResponse(error), {
        status: error.statusCode,
      });
    }

    // Handle generic errors
    return NextResponse.json(
      {
        error: {
          code: 'EXAM_PROCESSING_ERROR',
          message: 'Error al procesar examen',
        },
      },
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
