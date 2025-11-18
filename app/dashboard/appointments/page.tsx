'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  User,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  dateTime: Date;
  location?: string;
  doctorName?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    doctorName: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAppointment = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAppointment,
          dateTime: new Date(newAppointment.dateTime),
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewAppointment({
          title: '',
          description: '',
          dateTime: '',
          location: '',
          doctorName: '',
        });
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return;

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'SCHEDULED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    const labels = {
      CONFIRMED: 'Confirmada',
      SCHEDULED: 'Programada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
    };
    return labels[status];
  };

  const upcomingAppointments = appointments.filter(
    (a) =>
      new Date(a.dateTime) > new Date() &&
      (a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  );
  const pastAppointments = appointments.filter(
    (a) =>
      new Date(a.dateTime) <= new Date() || a.status === 'COMPLETED' || a.status === 'CANCELLED'
  );

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
            <div className="mb-2 flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Citas Médicas</h1>
            </div>
            <p className="text-muted-foreground">
              Gestiona tus citas y consultas médicas
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Próximas Citas</p>
            <p className="mt-1 text-3xl font-bold">{upcomingAppointments.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Citas Pasadas</p>
            <p className="mt-1 text-3xl font-bold">{pastAppointments.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="mt-1 text-3xl font-bold">{appointments.length}</p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Próximas Citas</h2>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {appointment.title}
                        </h3>
                        <Badge variant={getStatusColor(appointment.status) as any}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>

                      {appointment.description && (
                        <p className="mb-3 text-sm text-muted-foreground">
                          {appointment.description}
                        </p>
                      )}

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(appointment.dateTime).toLocaleString('es-ES', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        {appointment.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {appointment.location}
                          </div>
                        )}

                        {appointment.doctorName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Dr/a. {appointment.doctorName}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAppointment(appointment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Historial de Citas</h2>
            <div className="space-y-3">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border bg-card p-4 opacity-75 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{appointment.title}</h3>
                        <Badge variant={getStatusColor(appointment.status) as any}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.dateTime).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAppointment(appointment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">No tienes citas programadas</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Comienza a organizar tus consultas médicas
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Programar Primera Cita
            </Button>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Cita Médica</DialogTitle>
              <DialogDescription>
                Programa una nueva cita o consulta médica
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Título</label>
                <input
                  type="text"
                  value={newAppointment.title}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, title: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Consulta Cardiología"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={newAppointment.dateTime}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      dateTime: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Médico (opcional)
                </label>
                <input
                  type="text"
                  value={newAppointment.doctorName}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      doctorName: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nombre del médico"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ubicación (opcional)
                </label>
                <input
                  type="text"
                  value={newAppointment.location}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      location: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Hospital o clínica"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newAppointment.description}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Motivo de la consulta..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={createAppointment}
                  disabled={!newAppointment.title || !newAppointment.dateTime}
                  className="flex-1"
                >
                  Crear Cita
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
