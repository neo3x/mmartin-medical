'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  Upload,
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UploadExamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState('BLOOD');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Solo se permiten archivos PDF');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Solo se permiten archivos PDF');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (!examName.trim()) {
      setError('Por favor ingresa el nombre del examen');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examName', examName);
      formData.append('examType', examType);

      const response = await fetch('/api/exams', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir el examen');
      }

      const data = await response.json();
      router.push(`/dashboard/exams/${data.examId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el examen');
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading') {
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
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/exams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Exámenes
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Upload className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Subir Examen Médico</h1>
          </div>
          <p className="text-muted-foreground">
            MARTIN analizará tu examen y te dará una interpretación detallada
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Info */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Información del Examen</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nombre del Examen
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Hemograma Completo Diciembre 2024"
                  required
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tipo de Examen
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isUploading}
                >
                  <option value="BLOOD">Análisis de Sangre</option>
                  <option value="URINE">Análisis de Orina</option>
                  <option value="IMAGING">Imagen Médica (Rayos X, TAC, RMN)</option>
                  <option value="CARDIAC">Cardiológico (ECG, Eco)</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Archivo PDF</h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25'
              }`}
            >
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <FileText className="mb-4 h-16 w-16 text-primary" />
                  <p className="mb-2 font-medium">{file.name}</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="mb-2 font-medium">
                    Arrastra tu archivo PDF aquí o
                  </p>
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Seleccionar archivo
                    </Button>
                  </label>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Solo archivos PDF, máximo 10 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!file || !examName.trim() || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analizando examen...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Subir y Analizar Examen
              </>
            )}
          </Button>

          {/* Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-medium">Qué esperar:</p>
            <ul className="mt-2 space-y-1 pl-4">
              <li className="list-disc">
                MARTIN extraerá el texto del PDF automáticamente
              </li>
              <li className="list-disc">
                Analizará los valores y comparará con rangos normales
              </li>
              <li className="list-disc">
                Te dará una interpretación en lenguaje comprensible
              </li>
              <li className="list-disc">
                Detectará valores críticos que requieren atención
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
