'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  FileText,
  Calendar,
  AlertCircle,
  Download,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ExamDetail {
  id: string;
  examName: string;
  examType: string;
  uploadedAt: Date;
  fileUrl?: string;
  rawText?: string;
  interpretation: string;
  findings?: string[];
  recommendations?: string[];
  criticalValues?: string[];
  normalValues?: string[];
  hasCriticalValues: boolean;
}

export default function ExamDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchExam();
    }
  }, [session, params.id]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setExam(data.exam);
      } else {
        setError('Examen no encontrado');
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError('Error al cargar el examen');
    } finally {
      setIsLoading(false);
    }
  };

  const getExamTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BLOOD: 'Análisis de Sangre',
      URINE: 'Análisis de Orina',
      IMAGING: 'Imagen Médica',
      CARDIAC: 'Cardiológico',
      OTHER: 'Otro',
    };
    return labels[type] || 'Otro';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h3 className="mb-2 text-lg font-semibold">{error}</h3>
            <Button asChild className="mt-4">
              <Link href="/dashboard/exams">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Exámenes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/exams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Exámenes
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-full bg-primary p-3">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{exam.examName}</h1>
                  <p className="text-muted-foreground">
                    {getExamTypeLabel(exam.examType)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(exam.uploadedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {exam.fileUrl && (
              <Button variant="outline" asChild>
                <a href={exam.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Alert if Critical Values */}
        {exam.hasCriticalValues && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">
                  Valores Críticos Detectados
                </h3>
                <p className="mt-1 text-sm text-red-800">
                  Este examen contiene valores que requieren atención médica.
                  Consulta con tu médico lo antes posible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interpretation */}
        <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Interpretación de MARTIN</h2>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{exam.interpretation}</p>
          </div>
        </div>

        {/* Critical Values */}
        {exam.criticalValues && exam.criticalValues.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">
                Valores Críticos
              </h2>
            </div>
            <ul className="space-y-2">
              {exam.criticalValues.map((value, index) => (
                <li key={index} className="flex items-start gap-2 text-red-900">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-600" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Normal Values */}
        {exam.normalValues && exam.normalValues.length > 0 && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">
                Valores Normales
              </h2>
            </div>
            <ul className="space-y-2">
              {exam.normalValues.map((value, index) => (
                <li key={index} className="flex items-start gap-2 text-green-900">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Findings */}
        {exam.findings && exam.findings.length > 0 && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold">Hallazgos</h2>
            <ul className="space-y-2">
              {exam.findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {exam.recommendations && exam.recommendations.length > 0 && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold text-blue-900">
              Recomendaciones
            </h2>
            <ul className="space-y-2">
              {exam.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-900">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw Text (Collapsible) */}
        {exam.rawText && (
          <details className="rounded-lg border bg-card p-6 shadow-sm">
            <summary className="cursor-pointer font-semibold">
              Ver Texto Extraído del PDF
            </summary>
            <div className="mt-4 rounded bg-muted p-4">
              <pre className="whitespace-pre-wrap text-xs">{exam.rawText}</pre>
            </div>
          </details>
        )}

        {/* Disclaimer */}
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          <p className="font-medium">Aviso importante:</p>
          <p className="mt-1">
            Esta interpretación es generada por IA y tiene fines informativos.
            No reemplaza el diagnóstico ni la opinión de un profesional médico.
            Consulta siempre con tu médico para cualquier decisión sobre tu salud.
          </p>
        </div>
      </div>
    </div>
  );
}
