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

    const medication = await prisma.medication.findUnique({
      where: { id: params.id },
    });

    if (!medication) {
      return NextResponse.json(
        { error: 'Medicamento no encontrado' },
        { status: 404 }
      );
    }

    // Log medication view
    await prisma.vademecumQuery.create({
      data: {
        userId: user.id,
        query: medication.name,
        searchType: 'VIEW',
        resultsCount: 1,
        metadata: {
          medicationId: medication.id,
        },
      },
    });

    return NextResponse.json({
      medication: {
        id: medication.id,
        name: medication.name,
        activeIngredient: medication.activeIngredient,
        dosageForm: medication.dosageForm,
        strength: medication.strength,
        manufacturer: medication.manufacturer,
        description: medication.description,
        indications: medication.indications,
        contraindications: medication.contraindications,
        sideEffects: medication.sideEffects,
        dosageInstructions: medication.dosageInstructions,
        warnings: medication.warnings,
        interactions: medication.interactions,
        storageInstructions: medication.storageInstructions,
        prescriptionRequired: medication.prescriptionRequired,
      },
    });
  } catch (error) {
    console.error('Medication detail error:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del medicamento' },
      { status: 500 }
    );
  }
}
