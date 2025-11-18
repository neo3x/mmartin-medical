'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  Scale,
  Heart,
  Droplet,
  Thermometer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface HealthMetric {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  recordedAt: Date;
  notes?: string;
}

interface MetricSummary {
  type: string;
  latest: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export default function MetricsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [summaries, setSummaries] = useState<MetricSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState('WEIGHT');
  const [newMetric, setNewMetric] = useState({
    metricType: 'WEIGHT',
    value: '',
    unit: 'kg',
    notes: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchMetrics();
    }
  }, [session]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || []);
        setSummaries(data.summaries || []);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMetric = async () => {
    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMetric,
          value: parseFloat(newMetric.value),
        }),
      });

      if (response.ok) {
        setShowAddDialog(false);
        setNewMetric({
          metricType: 'WEIGHT',
          value: '',
          unit: 'kg',
          notes: '',
        });
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error adding metric:', error);
    }
  };

  const getMetricsByType = (type: string) => {
    return metrics
      .filter((m) => m.metricType === type)
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      )
      .map((m) => ({
        date: new Date(m.recordedAt).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
        }),
        value: m.value,
        fullDate: new Date(m.recordedAt),
      }));
  };

  const metricConfigs = [
    {
      type: 'WEIGHT',
      label: 'Peso',
      icon: Scale,
      color: '#3b82f6',
      unit: 'kg',
    },
    {
      type: 'BLOOD_PRESSURE_SYSTOLIC',
      label: 'Presión Arterial (Sistólica)',
      icon: Heart,
      color: '#ef4444',
      unit: 'mmHg',
    },
    {
      type: 'BLOOD_PRESSURE_DIASTOLIC',
      label: 'Presión Arterial (Diastólica)',
      icon: Heart,
      color: '#f59e0b',
      unit: 'mmHg',
    },
    {
      type: 'GLUCOSE',
      label: 'Glucosa',
      icon: Droplet,
      color: '#8b5cf6',
      unit: 'mg/dL',
    },
    {
      type: 'TEMPERATURE',
      label: 'Temperatura',
      icon: Thermometer,
      color: '#ec4899',
      unit: '°C',
    },
  ];

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
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Métricas de Salud</h1>
            </div>
            <p className="text-muted-foreground">
              Visualiza y rastrea tus indicadores de salud
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Métrica
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaries.slice(0, 4).map((summary) => {
            const config = metricConfigs.find((c) => c.type === summary.type);
            if (!config) return null;

            const Icon = config.icon;
            const trendIcon =
              summary.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : summary.trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : null;

            return (
              <div
                key={summary.type}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Icon className="h-6 w-6" style={{ color: config.color }} />
                  {trendIcon}
                </div>
                <p className="text-sm text-muted-foreground">{config.label}</p>
                <p className="mt-1 text-2xl font-bold">
                  {summary.latest} {summary.unit}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Promedio: {summary.average.toFixed(1)} {summary.unit}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {metricConfigs.map((config) => {
            const data = getMetricsByType(config.type);
            if (data.length === 0) return null;

            return (
              <div
                key={config.type}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="mb-6 flex items-center gap-3">
                  <config.icon className="h-6 w-6" style={{ color: config.color }} />
                  <h2 className="text-xl font-semibold">{config.label}</h2>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient
                        id={`gradient-${config.type}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={config.color}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={config.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      style={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      style={{ fontSize: 12 }}
                      tickMargin={10}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ fontWeight: 'bold' }}
                      formatter={(value: any) => [`${value} ${config.unit}`, config.label]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={config.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${config.type})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Recent values */}
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {data.slice(-5).reverse().map((point, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 rounded-lg border bg-muted/50 p-3"
                    >
                      <p className="text-xs text-muted-foreground">{point.date}</p>
                      <p className="mt-1 font-semibold">
                        {point.value} {config.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {metrics.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
            <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">
              No tienes métricas registradas
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Comienza a registrar tu peso, presión arterial, glucosa y más
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Primera Métrica
            </Button>
          </div>
        )}

        {/* Add Metric Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Métrica</DialogTitle>
              <DialogDescription>
                Agrega una nueva medición de salud
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tipo de Métrica
                </label>
                <select
                  value={newMetric.metricType}
                  onChange={(e) => {
                    const config = metricConfigs.find(
                      (c) => c.type === e.target.value
                    );
                    setNewMetric({
                      ...newMetric,
                      metricType: e.target.value,
                      unit: config?.unit || '',
                    });
                  }}
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {metricConfigs.map((config) => (
                    <option key={config.type} value={config.type}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Valor</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={newMetric.value}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, value: e.target.value })
                    }
                    className="flex-1 rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ej: 70.5"
                  />
                  <div className="flex items-center rounded-lg border bg-muted px-4 py-2">
                    {newMetric.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Notas (opcional)
                </label>
                <textarea
                  value={newMetric.notes}
                  onChange={(e) =>
                    setNewMetric({ ...newMetric, notes: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Contexto adicional..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={addMetric}
                  disabled={!newMetric.value}
                  className="flex-1"
                >
                  Registrar
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
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
