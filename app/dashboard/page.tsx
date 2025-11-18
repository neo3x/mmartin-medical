'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  FileText,
  MessageSquare,
  Pill,
  Calendar,
  TrendingUp,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardStats {
  totalChats: number;
  totalExams: number;
  upcomingAppointments: number;
  activeReminders: number;
}

interface RecentActivity {
  id: string;
  type: 'chat' | 'exam' | 'appointment' | 'vademecum';
  title: string;
  description: string;
  timestamp: Date;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalChats: 0,
    totalExams: 0,
    upcomingAppointments: 0,
    activeReminders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  if (!session?.user) {
    return null;
  }

  const quickActions = [
    {
      icon: MessageSquare,
      label: 'Nueva Consulta',
      description: 'Habla con MARTIN',
      href: '/dashboard/chat',
      color: 'bg-blue-500',
    },
    {
      icon: FileText,
      label: 'Subir Examen',
      description: 'Analizar resultados',
      href: '/dashboard/exams/upload',
      color: 'bg-green-500',
    },
    {
      icon: Pill,
      label: 'Vademecum',
      description: 'Buscar medicamentos',
      href: '/dashboard/vademecum',
      color: 'bg-purple-500',
    },
    {
      icon: Calendar,
      label: 'Citas',
      description: 'Ver calendario',
      href: '/dashboard/appointments',
      color: 'bg-orange-500',
    },
  ];

  const statCards = [
    {
      label: 'Consultas',
      value: stats.totalChats,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Exámenes',
      value: stats.totalExams,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Citas Próximas',
      value: stats.upcomingAppointments,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Recordatorios',
      value: stats.activeReminders,
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'chat':
        return MessageSquare;
      case 'exam':
        return FileText;
      case 'appointment':
        return Calendar;
      case 'vademecum':
        return Pill;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Hola, {session.user.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de salud personal
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Acciones Rápidas</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <div className="group cursor-pointer rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-3 ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold group-hover:text-primary">
                            {action.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Health Insights */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">
                Resumen de Salud
              </h2>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <h3 className="font-semibold">Estado General</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Basado en tu historial médico y consultas recientes, tu estado
                  de salud se mantiene estable. Continúa con tus controles
                  regulares.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/profile">
                    Actualizar Perfil Médico
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Actividad Reciente</h2>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">
                            {activity.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
                  <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No hay actividad reciente
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Comienza una consulta o sube un examen
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
