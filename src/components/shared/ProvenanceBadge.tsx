import { Landmark, Scale, FlaskConical } from 'lucide-react';

type Variant = 'government' | 'court' | 'demo';

const VARIANTS: Record<Variant, { label: string; icon: typeof Landmark; className: string }> = {
  government: {
    label: 'Government Data',
    icon: Landmark,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  court: {
    label: 'Public Court Data',
    icon: Scale,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  demo: {
    label: 'CaseLine Demo Data',
    icon: FlaskConical,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export default function ProvenanceBadge({ variant, source }: { variant: Variant; source?: string }) {
  const { label, icon: Icon, className } = VARIANTS[variant];
  return (
    <span
      title={source}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wider ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
      {source ? <span className="font-medium normal-case tracking-normal opacity-70">· {source}</span> : null}
    </span>
  );
}
