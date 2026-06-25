import Link from 'next/link';
import { buildPreviewHref, PREVIEW_CLIENT_SCENARIOS } from '@/lib/dev-access';
import { cn } from '@/lib/utils';

type ScenarioItem = {
  id: string;
  label: string;
  description: string;
};

interface PreviewScenarioNavProps {
  currentPath: string;
  currentScenario: string;
  scenarios?: ScenarioItem[];
  title?: string;
  hubPath?: string;
  hubLabel?: string;
}

export default function PreviewScenarioNav({
  currentPath,
  currentScenario,
  scenarios = PREVIEW_CLIENT_SCENARIOS,
  title = 'Demo client',
  hubPath = '/dashboard/client',
  hubLabel = 'Retour au hub client',
}: PreviewScenarioNavProps) {
  const activeScenario =
    scenarios.find((scenario) => scenario.id === currentScenario) ??
    scenarios[0];

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-sky-950">
            Scenario actif: {activeScenario.label}
          </p>
          <p className="mt-1 text-sm text-sky-800">{activeScenario.description}</p>
        </div>
        <Link
          href={buildPreviewHref(hubPath, currentScenario)}
          className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-300 hover:text-sky-900"
        >
          {hubLabel}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={buildPreviewHref(currentPath, scenario.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              scenario.id === currentScenario
                ? 'bg-sky-700 text-white'
                : 'bg-white text-sky-700 hover:bg-sky-100'
            )}
          >
            {scenario.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
