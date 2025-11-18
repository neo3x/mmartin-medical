'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Plus,
  Pill,
  Calendar,
  Activity as Gauge,
  CheckCircle,
  Clock,
  Edit,
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
  DialogClose,
} from '@/components/ui/dialog';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderType: 'MEDICATION' | 'APPOINTMENT' | 'MEASUREMENT' | 'GENERAL';
  scheduledFor: Date;
  frequency?: string;
  isActive: boolean;
  isCompleted: boolean;
}

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminderType: 'MEDICATION' as const,
    scheduledFor: '',
    frequency: 'ONCE',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchReminders();
    }
  }, [session]);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders');
      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReminder = async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReminder,
          scheduledFor: new Date(newReminder.scheduledFor),
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewReminder({
          title: '',
          description: '',
          reminderType: 'MEDICATION',
          scheduledFor: '',
          frequency: 'ONCE',
        });
        fetchReminders();
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este recordatorio?')) return;

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const getReminderIcon = (type: Reminder['reminderType']) => {
    switch (type) {
      case 'MEDICATION':
        return Pill;
      case 'APPOINTMENT':
        return Calendar;
      case 'MEASUREMENT':
        return Gauge;
      default:
        return Bell;
    }
  };

  const getReminderColor = (type: Reminder['reminderType']) => {
    switch (type) {
      case 'MEDICATION':
        return 'text-blue-600 bg-blue-50';
      case 'APPOINTMENT':
        return 'text-green-600 bg-green-50';
      case 'MEASUREMENT':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const activeReminders = reminders.filter((r) => r.isActive && !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);
  const inactiveReminders = reminders.filter((r) => !r.isActive && !r.isCompleted);

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
              <Bell className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Recordatorios</h1>
            </div>
            <p className="text-muted-foreground">
              Gestiona tus medicamentos, citas y mediciones
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Recordatorio
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Activos</p>
            <p className="mt-1 text-3xl font-bold">{activeReminders.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Completados Hoy</p>
            <p className="mt-1 text-3xl font-bold">{completedReminders.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Inactivos</p>
            <p className="mt-1 text-3xl font-bold">{inactiveReminders.length}</p>
          </div>
        </div>

        {/* Active Reminders */}
        {activeReminders.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Recordatorios Activos</h2>
            <div className="space-y-3">
              {activeReminders.map((reminder) => {
                const Icon = getReminderIcon(reminder.reminderType);
                const isOverdue = new Date(reminder.scheduledFor) < new Date();

                return (
                  <div
                    key={reminder.id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 gap-4">
                        <div
                          className={`rounded-lg p-3 ${getReminderColor(
                            reminder.reminderType
                          )}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{reminder.title}</h3>
                            {isOverdue && (
                              <Badge variant="destructive">Vencido</Badge>
                            )}
                          </div>
                          {reminder.description && (
                            <p className="mb-2 text-sm text-muted-foreground">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(reminder.scheduledFor).toLocaleString(
                                'es-ES',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </div>
                            {reminder.frequency && reminder.frequency !== 'ONCE' && (
                              <Badge variant="outline">{reminder.frequency}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleReminder(reminder.id, reminder.isActive)
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeReminders.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">
              No tienes recordatorios activos
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Crea un recordatorio para tus medicamentos, citas o mediciones
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Recordatorio
            </Button>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Recordatorio</DialogTitle>
              <DialogDescription>
                Crea un recordatorio para medicamentos, citas o mediciones
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Título</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, title: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Tomar Metformina"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Tipo</label>
                <select
                  value={newReminder.reminderType}
                  onChange={(e) =>
                    setNewReminder({
                      ...newReminder,
                      reminderType: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="MEDICATION">Medicamento</option>
                  <option value="APPOINTMENT">Cita Médica</option>
                  <option value="MEASUREMENT">Medición</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  value={newReminder.scheduledFor}
                  onChange={(e) =>
                    setNewReminder({
                      ...newReminder,
                      scheduledFor: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Frecuencia
                </label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, frequency: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ONCE">Una vez</option>
                  <option value="DAILY">Diario</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) =>
                    setNewReminder({
                      ...newReminder,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={createReminder}
                  disabled={!newReminder.title || !newReminder.scheduledFor}
                  className="flex-1"
                >
                  Crear Recordatorio
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
