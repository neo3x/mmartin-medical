'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  Search,
  Pill,
  Camera,
  Mic,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Medication {
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
}

export default function VademecumPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'text' | 'voice' | 'image'>('text');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSearch = async (query?: string) => {
    const searchText = query || searchQuery;
    if (!searchText.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/vademecum/search?q=${encodeURIComponent(searchText)}`
      );

      if (response.ok) {
        const data = await response.json();
        setMedications(data.medications);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching medications:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = async () => {
    setSearchType('voice');
    // TODO: Implement voice search with speech-to-text
    alert('Búsqueda por voz próximamente disponible');
  };

  const handleImageSearch = async () => {
    setSearchType('image');
    // TODO: Implement image upload and OCR
    alert('Búsqueda por imagen próximamente disponible');
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
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Pill className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Vademecum</h1>
          </div>
          <p className="text-muted-foreground">
            Busca información sobre medicamentos
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Buscar medicamento
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nombre del medicamento, principio activo..."
                  className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSearching}
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Alternative Search Methods */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceSearch}
              disabled={isSearching}
            >
              <Mic className="mr-2 h-4 w-4" />
              Buscar por Voz
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImageSearch}
              disabled={isSearching}
            >
              <Camera className="mr-2 h-4 w-4" />
              Buscar por Foto
            </Button>
          </div>
        </div>

        {/* Results */}
        <div>
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isSearching && hasSearched && medications.length === 0 && (
            <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                No se encontraron resultados
              </h3>
              <p className="text-sm text-muted-foreground">
                Intenta con otro término de búsqueda o usa la búsqueda por voz
              </p>
            </div>
          )}

          {!isSearching && !hasSearched && (
            <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
              <Pill className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">
                Busca un medicamento
              </h3>
              <p className="text-sm text-muted-foreground">
                Ingresa el nombre del medicamento o principio activo para comenzar
              </p>
            </div>
          )}

          {!isSearching && medications.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {medications.length} resultado{medications.length !== 1 ? 's' : ''}{' '}
                encontrado{medications.length !== 1 ? 's' : ''}
              </p>

              {medications.map((med) => (
                <Link
                  key={med.id}
                  href={`/dashboard/vademecum/${med.id}`}
                  className="block"
                >
                  <div className="group cursor-pointer rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold group-hover:text-primary">
                          {med.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {med.activeIngredient}
                        </p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <span className="font-medium">Forma:</span>{' '}
                        {med.dosageForm}
                      </div>
                      <div>
                        <span className="font-medium">Dosis:</span> {med.strength}
                      </div>
                      <div>
                        <span className="font-medium">Fabricante:</span>{' '}
                        {med.manufacturer}
                      </div>
                    </div>

                    {med.description && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {med.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center text-xs text-primary">
                      <Info className="mr-1 h-4 w-4" />
                      Ver información completa
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popular Medications */}
        {!hasSearched && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Consultas Frecuentes</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                'Paracetamol',
                'Ibuprofeno',
                'Amoxicilina',
                'Omeprazol',
                'Metformina',
                'Losartán',
              ].map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSearchQuery(name);
                    handleSearch(name);
                  }}
                  className="rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
