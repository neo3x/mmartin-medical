import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const metricSchema = z.object({
  metricType: z.enum([
    'WEIGHT',
    'HEIGHT',
    'BMI',
    'BLOOD_PRESSURE_SYSTOLIC',
    'BLOOD_PRESSURE_DIASTOLIC',
    'HEART_RATE',
    'TEMPERATURE',
    'GLUCOSE',
    'OXYGEN_SATURATION',
    'STEPS',
    'SLEEP_HOURS',
    'WATER_INTAKE',
  ]),
  value: z.number(),
  unit: z.string(),
  notes: z.string().optional(),
});

// GET - Retrieve all metrics for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    const metrics = await prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    // Calculate summaries for each metric type
    const metricTypes = [
      'WEIGHT',
      'BLOOD_PRESSURE_SYSTOLIC',
      'BLOOD_PRESSURE_DIASTOLIC',
      'GLUCOSE',
      'TEMPERATURE',
    ];

    const summaries = metricTypes.map((type) => {
      const typeMetrics = metrics.filter((m) => m.metricType === type);
      if (typeMetrics.length === 0) return null;

      const values = typeMetrics.map((m) => m.value);
      const latest = typeMetrics[0].value;
      const average = values.reduce((a, b) => a + b, 0) / values.length;

      // Calculate trend (comparing last 3 vs previous 3)
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (typeMetrics.length >= 6) {
        const recent = typeMetrics.slice(0, 3).map((m) => m.value);
        const previous = typeMetrics.slice(3, 6).map((m) => m.value);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
        const change = ((recentAvg - previousAvg) / previousAvg) * 100;

        if (Math.abs(change) > 2) {
          trend = change > 0 ? 'up' : 'down';
        }
      }

      return {
        type,
        latest,
        average: Math.round(average * 10) / 10,
        trend,
        unit: typeMetrics[0].unit,
      };
    }).filter(Boolean);

    return NextResponse.json({
      metrics: metrics.map((m) => ({
        id: m.id,
        metricType: m.metricType,
        value: m.value,
        unit: m.unit,
        recordedAt: m.recordedAt,
        notes: m.notes,
      })),
      summaries,
    });
  } catch (error) {
    console.error('Metrics GET error:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    );
  }
}

// POST - Create new metric
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validatedData = metricSchema.parse(body);

    const metric = await prisma.healthMetric.create({
      data: {
        userId,
        metricType: validatedData.metricType,
        value: validatedData.value,
        unit: validatedData.unit,
        notes: validatedData.notes,
      },
    });

    // Check for critical values and create notification
    let isCritical = false;
    let criticalMessage = '';

    if (validatedData.metricType === 'BLOOD_PRESSURE_SYSTOLIC' && validatedData.value > 140) {
      isCritical = true;
      criticalMessage = 'Presión arterial sistólica elevada detectada';
    } else if (validatedData.metricType === 'BLOOD_PRESSURE_DIASTOLIC' && validatedData.value > 90) {
      isCritical = true;
      criticalMessage = 'Presión arterial diastólica elevada detectada';
    } else if (validatedData.metricType === 'GLUCOSE' && validatedData.value > 140) {
      isCritical = true;
      criticalMessage = 'Glucosa elevada detectada';
    } else if (validatedData.metricType === 'TEMPERATURE' && validatedData.value > 38) {
      isCritical = true;
      criticalMessage = 'Temperatura elevada detectada';
    }

    if (isCritical) {
      await prisma.notification.create({
        data: {
          userId,
          title: 'Alerta: Valor Crítico',
          message: criticalMessage,
          type: 'ALERT',
          relatedEntityId: metric.id,
        },
      });
    }

    return NextResponse.json({
      message: 'Métrica registrada',
      metric: {
        id: metric.id,
        metricType: metric.metricType,
        value: metric.value,
        unit: metric.unit,
        recordedAt: metric.recordedAt,
      },
      isCritical,
    });
  } catch (error) {
    console.error('Metric POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al registrar métrica' },
      { status: 500 }
    );
  }
}
