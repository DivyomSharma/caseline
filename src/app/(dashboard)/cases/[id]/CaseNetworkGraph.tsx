'use client';

import React from 'react';
import Link from 'next/link';

type NodeType = 'case' | 'officer' | 'criminal' | 'victim' | 'evidence';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  href?: string;
}

const COLORS: Record<NodeType, string> = {
  case: '#0f172a',
  officer: '#2563eb',
  criminal: '#dc2626',
  victim: '#16a34a',
  evidence: '#a855f7',
};

// Simple radial layout — no graph library dependency. The case sits at the
// center; every linked entity is placed on a ring around it, spaced evenly.
export default function CaseNetworkGraph({
  caseLabel,
  officer,
  criminals,
  victims,
  evidence,
}: {
  caseLabel: string;
  officer: GraphNode | null;
  criminals: GraphNode[];
  victims: GraphNode[];
  evidence: GraphNode[];
}) {
  const outerNodes: GraphNode[] = [
    ...(officer ? [officer] : []),
    ...criminals,
    ...victims,
    ...evidence,
  ];

  const width = 640;
  const height = 420;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 150;

  const positioned = outerNodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / Math.max(outerNodes.length, 1) - Math.PI / 2;
    return {
      ...node,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {positioned.map((node) => (
          <line key={`line-${node.id}`} x1={cx} y1={cy} x2={node.x} y2={node.y} stroke="#e2e8f0" strokeWidth={1.5} />
        ))}

        {/* Center: the case */}
        <circle cx={cx} cy={cy} r={34} fill={COLORS.case} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="white">
          {caseLabel.length > 14 ? caseLabel.slice(0, 12) + '…' : caseLabel}
        </text>

        {positioned.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={22} fill={COLORS[node.type]} opacity={0.9} />
            <text x={node.x} y={node.y + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">
              {node.label.length > 10 ? node.label.slice(0, 9) + '…' : node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {(['officer', 'criminal', 'victim', 'evidence'] as NodeType[]).map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[type] }} />
            {type}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {positioned
          .filter((n) => n.href)
          .map((n) => (
            <Link
              key={`link-${n.id}`}
              href={n.href!}
              className="text-[10px] font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] underline"
            >
              {n.label}
            </Link>
          ))}
      </div>
    </div>
  );
}
