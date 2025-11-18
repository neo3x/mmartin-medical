'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Pill,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MedicationDetail {
  id: string;
  name: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  description?: string;
  indications?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  dosageInstructions?: string;
  warnings?: string[];
  interactions?: string[];
  storageInstructions?: string;
  prescriptionRequired?: boolean;
}

export default function MedicationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [medication, setMedication] = useState<MedicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchMedication();
    }
  }, [session, params.id]);

  const fetchMedication = async () => {
    try {
      const response = await fetch(`/api/vademecum/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setMedication(data.medication);
      } else {
        setError('Medicamento no encontrado');
      }
    } catch (error) {
      console.error('Error fetching medication:', error);
      setError('Error al cargar la información');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h3 className="mb-2 text-lg font-semibold">{error}</h3>
            <Button asChild className="mt-4">
              <Link href="/dashboard/vademecum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a búsqueda
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!medication) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/vademecum">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a búsqueda
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary p-4">
              <Pill className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{medication.name}</h1>
              <p className="text-lg text-muted-foreground">
                {medication.activeIngredient}
              </p>
              {medication.prescriptionRequired && (
                <div className="mt-2 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Requiere receta médica
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Información General</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Forma Farmacéutica:
              </span>
              <p className="font-medium">{medication.dosageForm}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Concentración:
              </span>
              <p className="font-medium">{medication.strength}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Fabricante:
              </span>
              <p className="font-medium">{medication.manufacturer}</p>
            </div>
          </div>
          {medication.description && (
            <div className="mt-4">
              <span className="text-sm font-medium text-muted-foreground">
                Descripción:
              </span>
              <p className="mt-1">{medication.description}</p>
            </div>
          )}
        </div>

        {/* Indications */}
        {medication.indications && medication.indications.length > 0 && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Indicaciones</h2>
            </div>
            <ul className="space-y-2">
              {medication.indications.map((indication, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600" />
                  <span>{indication}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dosage Instructions */}
        {medication.dosageInstructions && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Posología</h2>
            </div>
            <p>{medication.dosageInstructions}</p>
          </div>
        )}

        {/* Contraindications */}
        {medication.contraindications && medication.contraindications.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">
                Contraindicaciones
              </h2>
            </div>
            <ul className="space-y-2">
              {medication.contraindications.map((contraindication, index) => (
                <li key={index} className="flex items-start gap-2 text-red-900">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-600" />
                  <span>{contraindication}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Side Effects */}
        {medication.sideEffects && medication.sideEffects.length > 0 && (
          <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-orange-900">
                Efectos Secundarios
              </h2>
            </div>
            <ul className="space-y-2">
              {medication.sideEffects.map((effect, index) => (
                <li key={index} className="flex items-start gap-2 text-orange-900">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-600" />
                  <span>{effect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactions */}
        {medication.interactions && medication.interactions.length > 0 && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-semibold">Interacciones</h2>
            </div>
            <ul className="space-y-2">
              {medication.interactions.map((interaction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-600" />
                  <span>{interaction}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {medication.warnings && medication.warnings.length > 0 && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Advertencias</h2>
            </div>
            <ul className="space-y-2">
              {medication.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Storage Instructions */}
        {medication.storageInstructions && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold">Almacenamiento</h2>
            <p>{medication.storageInstructions}</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Aviso importante:</p>
          <p className="mt-1">
            Esta información es de carácter informativo. Consulta siempre con un
            profesional de la salud antes de iniciar o modificar cualquier
            tratamiento médico.
          </p>
        </div>
      </div>
    </div>
  );
}
