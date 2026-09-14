import type Groq from 'groq-sdk';
import {
  getCases,
  getCaseById,
  getCriminals,
  getCriminalById,
  getOfficers,
  getOfficerById,
  getVictims,
  getFIRs,
  getPoliceStations,
  getPoliceStationById,
  getAllEvidence,
  getAllInvestigations,
  getDashboardStats,
  getLegalSections,
  getCaseSections,
} from '@/lib/supabase/db';
import { groupByRangeAndDistrict } from '@/lib/delhi-org';

export const AI_TOOLS: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getCases',
      description: 'List cases, optionally filtered by status, priority, station, officer, or free-text search.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Free-text search across case number, crime type, location, officer name, FIR number' },
          status: { type: 'string', enum: ['registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed', 'solved', 'closed'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          stationId: { type: 'string', description: 'Police station UUID' },
          officerId: { type: 'string', description: 'Officer UUID' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCaseById',
      description: 'Get full detail for a single case by its UUID, including linked FIR, investigations, evidence.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Case UUID' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCriminals',
      description: 'List criminal records, optionally filtered by a free-text search on name/alias.',
      parameters: {
        type: 'object',
        properties: { search: { type: 'string' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCriminalById',
      description: 'Get full detail for a single criminal record by UUID.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Criminal UUID' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOfficers',
      description: 'List all officers with rank, station, and status.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOfficerById',
      description: 'Get full detail for a single officer by UUID.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Officer UUID' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getVictims',
      description: 'List victims/complainants, optionally filtered by free-text search on name.',
      parameters: {
        type: 'object',
        properties: { search: { type: 'string' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getFIRs',
      description: 'List all First Information Reports (FIRs).',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPoliceStations',
      description: 'List all police stations.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPoliceStationById',
      description: 'Get full detail for a single police station by UUID.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Station UUID' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAllEvidence',
      description: 'List all evidence items across all cases, with case linkage.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAllInvestigations',
      description: 'List all investigation log entries across all cases, with case and officer linkage.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDashboardStats',
      description: 'Get aggregate stats: total cases, cases by status, cases by priority, recent activity counts.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchLegalSections',
      description: 'Search the Bharatiya Nyaya Sanhita (BNS) legal corpus by keyword, title, or IPC-equivalent section number. Always use this before answering any question about applicable law or section numbers — never invent a section number or its text.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Keyword, offence name, or section number to search for' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCaseSections',
      description: 'Get the BNS legal sections already linked to a specific case by its UUID.',
      parameters: {
        type: 'object',
        properties: { caseId: { type: 'string', description: 'Case UUID' } },
        required: ['caseId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOrgHierarchy',
      description: 'Get the Delhi Police organisational hierarchy (Range -> District -> Police Station) for the currently registered stations.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

type ToolFn = (args: any) => Promise<unknown>;

const TOOL_MAP: Record<string, ToolFn> = {
  getCases: (args) => getCases(args),
  getCaseById: (args) => getCaseById(args.id),
  getCriminals: (args) => getCriminals(args.search),
  getCriminalById: (args) => getCriminalById(args.id),
  getOfficers: () => getOfficers(),
  getOfficerById: (args) => getOfficerById(args.id),
  getVictims: (args) => getVictims(args.search),
  getFIRs: () => getFIRs(),
  getPoliceStations: () => getPoliceStations(),
  getPoliceStationById: (args) => getPoliceStationById(args.id),
  getAllEvidence: () => getAllEvidence(),
  getAllInvestigations: () => getAllInvestigations(),
  getDashboardStats: () => getDashboardStats(),
  searchLegalSections: (args) => getLegalSections(args.query),
  getCaseSections: (args) => getCaseSections(args.caseId),
  getOrgHierarchy: async () => {
    const stations = await getPoliceStations();
    return groupByRangeAndDistrict(stations);
  },
};

export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const fn = TOOL_MAP[name];
  if (!fn) {
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
  try {
    const result = await fn(args);
    return JSON.stringify(result ?? { error: 'Not found' });
  } catch (err) {
    return JSON.stringify({ error: err instanceof Error ? err.message : 'Tool execution failed' });
  }
}
