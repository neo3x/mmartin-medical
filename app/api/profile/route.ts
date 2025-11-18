import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  bloodType: z
    .enum([
      'A_POSITIVE',
      'A_NEGATIVE',
      'B_POSITIVE',
      'B_NEGATIVE',
      'AB_POSITIVE',
      'AB_NEGATIVE',
      'O_POSITIVE',
      'O_NEGATIVE',
    ])
    .optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
  technicalLevel: z
    .enum(['SIMPLE', 'MODERATE', 'TECHNICAL', 'EXPERT'])
    .optional(),
});

// GET - Retrieve user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        medicalProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile: user.medicalProfile
        ? {
            dateOfBirth: user.medicalProfile.dateOfBirth?.toISOString().split('T')[0],
            gender: user.medicalProfile.gender,
            bloodType: user.medicalProfile.bloodType,
            height: user.medicalProfile.height,
            weight: user.medicalProfile.weight,
            allergies: user.medicalProfile.allergies,
            chronicConditions: user.medicalProfile.chronicConditions,
            currentMedications: user.medicalProfile.currentMedications,
            emergencyContact: user.medicalProfile.emergencyContact,
            emergencyPhone: user.medicalProfile.emergencyPhone,
            insuranceProvider: user.medicalProfile.insuranceProvider,
            insuranceNumber: user.medicalProfile.insuranceNumber,
            preferredLanguage: user.medicalProfile.preferredLanguage,
            technicalLevel: user.medicalProfile.technicalLevel,
          }
        : null,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Convert dateOfBirth string to Date if present
    const dateOfBirth = validatedData.dateOfBirth
      ? new Date(validatedData.dateOfBirth)
      : undefined;

    // Upsert medical profile
    const profile = await prisma.medicalProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...validatedData,
        dateOfBirth,
      },
      update: {
        ...validatedData,
        dateOfBirth,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PROFILE_UPDATE',
        resourceType: 'MEDICAL_PROFILE',
        resourceId: profile.id,
        details: {
          updatedFields: Object.keys(validatedData),
        },
      },
    });

    return NextResponse.json({
      message: 'Perfil actualizado correctamente',
      profile: {
        dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0],
        gender: profile.gender,
        bloodType: profile.bloodType,
        height: profile.height,
        weight: profile.weight,
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContact: profile.emergencyContact,
        emergencyPhone: profile.emergencyPhone,
        insuranceProvider: profile.insuranceProvider,
        insuranceNumber: profile.insuranceNumber,
        preferredLanguage: profile.preferredLanguage,
        technicalLevel: profile.technicalLevel,
      },
    });
  } catch (error) {
    console.error('Profile PUT error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}
