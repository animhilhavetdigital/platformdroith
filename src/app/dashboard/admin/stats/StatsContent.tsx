'use client';

import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface StatsContentProps {
  data: any;
}

export default function StatsContent({ data }: StatsContentProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const computed = useMemo(() => {
    const base = data?.stats;
    if (!base) return null;

    const multipliers = { day: 0.08, week: 0.35, month: 1 };
    const m = multipliers[period];

    const parseValue = (val: string) => {
      const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
      return num * m;
    };

    const formatHours = (val: number) => `${Math.round(val)}h`;
    const formatPercent = (val: number) => `${val.toFixed(0)}%`;
    const formatAmount = (val: number) => `${Math.round(val)} kEUR`;
    const formatSatisfaction = (val: number) => `${(val / 10).toFixed(1)}/5`;

    return {
      conversionRate: formatPercent(parseValue(base.conversionRate)),
      avgAnalysisHours: formatHours(parseValue(base.avgAnalysisHours)),
      satisfaction: formatSatisfaction(parseValue(base.satisfaction)),
      recoveredAmount: formatAmount(parseValue(base.recoveredAmount)),
      monthlyVolumes: base.monthlyVolumes.map((v: number) => Math.max(1, Math.round(v * m))),
    };
  }, [data, period]);

  if (!computed) return null;

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-sm text-gray-500">Vue d&apos;ensemble des indicateurs</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodButton active={period === 'day'} onClick={() => setPeriod('day')}>
            Jour
          </PeriodButton>
          <PeriodButton active={period === 'week'} onClick={() => setPeriod('week')}>
            Semaine
          </PeriodButton>
          <PeriodButton active={period === 'month'} onClick={() => setPeriod('month')}>
            Mois
          </PeriodButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Volume */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Volume {period === 'day' ? 'journalier' : period === 'week' ? 'hebdomadaire' : 'mensuel'}
              </h2>
              <p className="text-xs text-gray-400">Evolution des dossiers</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {computed.monthlyVolumes.reduce((a: number, b: number) => a + b, 0)}
              </p>
              <p className="text-xs text-gray-400">dossiers</p>
            </div>
          </div>
          <div className="mt-6">
            <LineChart data={computed.monthlyVolumes} />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-gray-400">
            {computed.monthlyVolumes.map((_: number, index: number) => (
              <span key={index}>P{index + 1}</span>
            ))}
          </div>
        </div>

        {/* Activité */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Derniere activite</h2>
            <button
              onClick={() => alert('Voir toute l\'activite (demo)')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              Voir tout
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {data.users.map((user: any) => {
              const initials = user.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase();
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-primary-600 shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500">{user.lastActive}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Répartition */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Repartition des statuts</h2>
          <p className="text-xs text-gray-400">Repartition des dossiers par etape</p>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <DonutChart data={data.stats.statusBreakdown} />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-1">
              {data.stats.statusBreakdown.map((entry: any, index: number) => (
                <div key={entry.label} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                  />
                  <span className="text-xs font-semibold text-gray-600">{entry.label}</span>
                  <span className="ml-auto text-xs font-bold text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Indicateurs cles</h2>
              <p className="text-xs text-gray-400">
                Performance {period === 'day' ? 'journaliere' : period === 'week' ? 'hebdomadaire' : 'mensuelle'}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-600">
              <TrendingUp size={12} />
              +12%
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <KpiBox label="Conversion" value={computed.conversionRate} />
            <KpiBox label="Temps moyen" value={computed.avgAnalysisHours} />
            <KpiBox label="Satisfaction" value={computed.satisfaction} />
            <KpiBox label="Recupere" value={computed.recoveredAmount} />
          </div>
        </div>
      </div>
    </>
  );
}

function PeriodButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
        active ? 'bg-gray-900 text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

const DONUT_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#9ca3af'];

function DonutChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0) || 1;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="14" />
        {data.map((entry, index) => {
          const dash = (entry.value / total) * circumference;
          const segment = (
            <circle
              key={entry.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return segment;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{total}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">dossiers</span>
      </div>
    </div>
  );
}

function LineChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height * 0.7) - height * 0.15;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="h-48 w-full">
      <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#lineGradient)" />
        <polyline
          fill="none"
          points={points}
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((value - min) / range) * (height * 0.7) - height * 0.15;
          return <circle key={index} cx={x} cy={y} r="1.5" fill="#3b82f6" />;
        })}
      </svg>
    </div>
  );
}
