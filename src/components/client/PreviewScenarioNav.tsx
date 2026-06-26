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
  scenarioPaths?: Record<string, string>;
}

const CLIENT_SCENARIO_PATHS: Record<string, string> = {
  new: '/dashboard/client',
  form: '/dashboard/client/formulaire',
  analysis: '/dashboard/client/analyse',
  report: '/dashboard/client/rapport',
  orientation: '/dashboard/client/orientation',
  mediation: '/dashboard/client/negociateur',
  autonomy: '/dashboard/client',
  closed: '/dashboard/client/negociateur',
};

export default function PreviewScenarioNav({
  currentPath,
  currentScenario,
  scenarios = PREVIEW_CLIENT_SCENARIOS,
  title = 'Demo client',
  hubPath = '/dashboard/client',
  hubLabel = 'Retour au hub client',
  scenarioPaths,
}: PreviewScenarioNavProps) {
  return null;
}
