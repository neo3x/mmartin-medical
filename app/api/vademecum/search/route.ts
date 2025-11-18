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

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Parámetro de búsqueda requerido' },
        { status: 400 }
      );
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

    // Search medications by name or active ingredient
    const medications = await prisma.medication.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            activeIngredient: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            manufacturer: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 20,
      orderBy: {
        name: 'asc',
      },
    });

    // Log search query
    await prisma.vademecumQuery.create({
      data: {
        userId: user.id,
        query,
        searchType: 'TEXT',
        resultsCount: medications.length,
      },
    });

    return NextResponse.json({
      query,
      count: medications.length,
      medications: medications.map((med) => ({
        id: med.id,
        name: med.name,
        activeIngredient: med.activeIngredient,
        dosageForm: med.dosageForm,
        strength: med.strength,
        manufacturer: med.manufacturer,
        description: med.description,
        indications: med.indications,
        contraindications: med.contraindications,
        sideEffects: med.sideEffects,
      })),
    });
  } catch (error) {
    console.error('Vademecum search error:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 }
    );
  }
}
