'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, Save, Loader2, User, Heart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicalProfile {
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  preferredLanguage?: string;
  technicalLevel?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<MedicalProfile>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || {});
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Error al guardar perfil');
      }

      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayInput = (field: keyof MedicalProfile, value: string) => {
    const items = value.split(',').map((item) => item.trim()).filter(Boolean);
    setProfile({ ...profile, [field]: items });
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
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Perfil Médico</h1>
          <p className="text-muted-foreground">
            Completa tu información para recibir asistencia personalizada
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Información Personal</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={profile.dateOfBirth || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, dateOfBirth: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Género</label>
                <select
                  value={profile.gender || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                  <option value="OTHER">Otro</option>
                  <option value="PREFER_NOT_TO_SAY">Prefiero no decir</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tipo de Sangre
                </label>
                <select
                  value={profile.bloodType || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, bloodType: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar</option>
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      height: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      weight: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nivel Técnico de Respuestas
                </label>
                <select
                  value={profile.technicalLevel || 'MODERATE'}
                  onChange={(e) =>
                    setProfile({ ...profile, technicalLevel: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="SIMPLE">Simple (lenguaje cotidiano)</option>
                  <option value="MODERATE">Moderado (equilibrado)</option>
                  <option value="TECHNICAL">Técnico (términos médicos)</option>
                  <option value="EXPERT">Experto (profesional)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold">Información Médica</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Alergias
                </label>
                <textarea
                  value={profile.allergies?.join(', ') || ''}
                  onChange={(e) => handleArrayInput('allergies', e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Penicilina, Nueces, Polen (separados por comas)"
                  rows={2}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Condiciones Crónicas
                </label>
                <textarea
                  value={profile.chronicConditions?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInput('chronicConditions', e.target.value)
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Diabetes, Hipertensión (separados por comas)"
                  rows={2}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Medicamentos Actuales
                </label>
                <textarea
                  value={profile.currentMedications?.join(', ') || ''}
                  onChange={(e) =>
                    handleArrayInput('currentMedications', e.target.value)
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Metformina 500mg, Losartán 50mg (separados por comas)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Contacto de Emergencia</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  value={profile.emergencyContact || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, emergencyContact: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="María Pérez"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Teléfono de Emergencia
                </label>
                <input
                  type="tel"
                  value={profile.emergencyPhone || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, emergencyPhone: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Seguro Médico</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Proveedor de Seguro
                </label>
                <input
                  type="text"
                  value={profile.insuranceProvider || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      insuranceProvider: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Sanitas, Adeslas, etc."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Número de Póliza
                </label>
                <input
                  type="text"
                  value={profile.insuranceNumber || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, insuranceNumber: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123456789"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Perfil
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
