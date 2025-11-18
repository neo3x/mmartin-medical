'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  FileText,
  Upload,
  Calendar,
  AlertCircle,
  Eye,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ExamResult {
  id: string;
  examName: string;
  examType: string;
  uploadedAt: Date;
  fileUrl?: string;
  interpretation?: string;
  hasCriticalValues: boolean;
}

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchExams();
    }
  }, [session]);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExamTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BLOOD: 'bg-red-100 text-red-800',
      URINE: 'bg-yellow-100 text-yellow-800',
      IMAGING: 'bg-blue-100 text-blue-800',
      CARDIAC: 'bg-pink-100 text-pink-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.OTHER;
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

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Exámenes Médicos</h1>
            </div>
            <p className="text-muted-foreground">
              Historial de tus análisis y estudios
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/exams/upload">
              <Upload className="mr-2 h-4 w-4" />
              Subir Examen
            </Link>
          </Button>
        </div>

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">
              No tienes exámenes registrados
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Sube tus resultados de laboratorio o estudios médicos para que MARTIN
              los interprete
            </p>
            <Button asChild>
              <Link href="/dashboard/exams/upload">
                <Upload className="mr-2 h-4 w-4" />
                Subir tu Primer Examen
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{exam.examName}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getExamTypeColor(
                          exam.examType
                        )}`}
                      >
                        {getExamTypeLabel(exam.examType)}
                      </span>
                      {exam.hasCriticalValues && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                          <AlertCircle className="h-3 w-3" />
                          Valores críticos
                        </span>
                      )}
                    </div>

                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(exam.uploadedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    {exam.interpretation && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {exam.interpretation}
                      </p>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/exams/${exam.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle
                      </Link>
                    </Button>
                    {exam.fileUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={exam.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {exams.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total de Exámenes</p>
              <p className="mt-1 text-2xl font-bold">{exams.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Con Valores Críticos</p>
              <p className="mt-1 text-2xl font-bold">
                {exams.filter((e) => e.hasCriticalValues).length}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Último Examen</p>
              <p className="mt-1 text-sm font-medium">
                {exams[0]
                  ? new Date(exams[0].uploadedAt).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
