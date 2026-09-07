# Groq AI Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a native, floating AI chat assistant to Caseline, powered by Groq, that can answer natural-language questions across all case data via tool-calling against the existing `db.ts` data layer.

**Architecture:** A server-side chat API route (`/api/ai/chat`) runs a tool-calling loop against Groq (`llama-3.3-70b-versatile`): each tool maps 1:1 to an existing `db.ts` read function, so the model always sees live data with no separate context/index to maintain. A floating chat widget, mounted once in the dashboard layout, self-detects the current case id from the URL (no per-page wiring needed) and streams the final answer back to the user.

**Tech Stack:** Next.js 15 (App Router, Route Handlers), `groq-sdk`, React 19 client components, existing `src/lib/supabase/db.ts`.

## Global Constraints

- No new RLS/authorization logic — AI tools call the same `db.ts` functions the rest of the app already calls (spec: "Non-goals").
- No chat history persistence in this phase — client-side React state only (spec: "Non-goals").
- No AI-driven writes (no case creation/update via chat) in this phase (spec: "Non-goals").
- Missing `GROQ_API_KEY` must degrade gracefully (disabled widget / clear API error), never crash the app (spec: "Error handling").
- Tool-call loop capped at 5 iterations (spec: "Chat loop").
- No automated test framework exists in this codebase (verified: no `*.test.*`/`*.spec.*` files, no test runner in `package.json`). Verification in this plan is manual, run via the dev server, matching the spec's own "Testing" section and existing project convention.

---

### Task 1: Groq client + dependency

**Files:**
- Modify: `package.json` (add `groq-sdk` dependency)
- Create: `src/lib/ai/groq.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `getGroqClient(): Groq` — throws `Error('GROQ_API_KEY not configured')` if env var missing. Later tasks call this to get a configured client.

- [ ] **Step 1: Install `groq-sdk`**

Run: `npm install groq-sdk`

- [ ] **Step 2: Add env var placeholder**

Edit `.env.example`, append:

```
# Groq AI Assistant
# If unset, the AI chat widget is disabled (rest of the app is unaffected).
GROQ_API_KEY=
```

- [ ] **Step 3: Write the Groq client wrapper**

Create `src/lib/ai/groq.ts`:

```typescript
import Groq from 'groq-sdk';

let client: Groq | null = null;

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

export const GROQ_MODEL = 'llama-3.3-70b-versatile';
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/ai/groq.ts`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/ai/groq.ts
git commit -m "feat: add Groq client wrapper"
```

---

### Task 2: Tool definitions + dispatcher

**Files:**
- Create: `src/lib/ai/tools.ts`
- Test: manual (see Step 3)

**Interfaces:**
- Consumes: `db.ts` exports — `getCases`, `getCaseById`, `getCriminals`, `getCriminalById`, `getOfficers`, `getOfficerById`, `getVictims`, `getFIRs`, `getPoliceStations`, `getPoliceStationById`, `getAllEvidence`, `getAllInvestigations`, `getDashboardStats` (all from `@/lib/supabase/db`, already exist, no changes to them).
- Produces:
  - `AI_TOOLS: Groq.Chat.Completions.ChatCompletionTool[]` — tool definitions in Groq/OpenAI function-calling JSON schema format. Consumed by Task 3's chat route.
  - `async function executeTool(name: string, args: Record<string, unknown>): Promise<string>` — runs the matching `db.ts` function and returns a JSON-stringified result, or a JSON-stringified `{ error: string }` if the tool name is unknown or the call throws. Consumed by Task 3's tool-loop.

- [ ] **Step 1: Write the tool schema + dispatcher**

Create `src/lib/ai/tools.ts`:

```typescript
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
} from '@/lib/supabase/db';

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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/ai/tools.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/tools.ts
git commit -m "feat: add AI tool definitions wrapping db.ts reads"
```

Manual exercise of every tool happens naturally in Task 4 Step 4 through the real chat request path — no standalone script needed.

---

### Task 3: Chat API route with tool-calling loop

**Files:**
- Create: `src/app/api/ai/chat/route.ts`

**Interfaces:**
- Consumes: `getGroqClient`, `GROQ_MODEL`, `isGroqConfigured` from `@/lib/ai/groq` (Task 1); `AI_TOOLS`, `executeTool` from `@/lib/ai/tools` (Task 2).
- Produces: `POST /api/ai/chat` — accepts `{ messages: { role: 'user' | 'assistant'; content: string }[]; caseId?: string }`, returns a streamed `text/plain` response body (the assistant's final answer). On missing `GROQ_API_KEY`, returns `503` with JSON `{ error: 'AI assistant not configured' }`. Consumed by Task 4's widget.

- [ ] **Step 1: Write the route handler**

Create `src/app/api/ai/chat/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { getGroqClient, GROQ_MODEL, isGroqConfigured } from '@/lib/ai/groq';
import { AI_TOOLS, executeTool } from '@/lib/ai/tools';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are the Caseline AI assistant, embedded in a police case records management system.
You have access to tools that query live case data: cases, criminals, officers, victims, FIRs, police stations, evidence, investigation logs, and dashboard stats.
Always use the tools to look up real data before answering questions about specific records, counts, or statuses — never guess or invent data.
Be concise and factual. When listing multiple records, use a short bulleted list.`;

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  caseId?: string;
}

export async function POST(req: NextRequest) {
  if (!isGroqConfigured()) {
    return new Response(JSON.stringify({ error: 'AI assistant not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body: ChatRequestBody = await req.json();
  const groq = getGroqClient();

  const systemContent = body.caseId
    ? `${SYSTEM_PROMPT}\n\nThe user is currently viewing case ${body.caseId}. If their question is ambiguous about which case, assume they mean this one — use getCaseById with this id.`
    : SYSTEM_PROMPT;

  const conversation: any[] = [
    { role: 'system', content: systemContent },
    ...body.messages,
  ];

  const MAX_TOOL_ITERATIONS = 5;
  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: conversation,
      tools: AI_TOOLS,
      tool_choice: 'auto',
    });

    const message = completion.choices[0].message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return textResponse(message.content ?? '');
    }

    conversation.push({
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls,
    });

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments || '{}');
      const result = await executeTool(toolCall.function.name, args);
      conversation.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  // Iteration cap hit — ask for a final answer with whatever context we have, no more tools.
  const fallback = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      ...conversation,
      { role: 'system', content: 'Tool lookups were truncated after 5 steps. Answer with what you found so far and note the search was truncated.' },
    ],
  });
  return textResponse(fallback.choices[0].message.content ?? '');
}

function textResponse(content: string) {
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/app/api/ai/chat/route.ts`

- [ ] **Step 3: Manual test with curl (requires `GROQ_API_KEY` set in `.env.local` and dev server running)**

Run: `npm run dev` (separate terminal), then:

```bash
curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"How many cases are there in total?"}]}'
```

Expected: a plain-text response containing a number that matches `getDashboardStats` output, not an error.

- [ ] **Step 4: Manual test without `GROQ_API_KEY`**

Temporarily unset `GROQ_API_KEY` (comment out in `.env.local`), restart dev server, repeat the curl command.
Expected: HTTP 503, body `{"error":"AI assistant not configured"}`. Restore the env var afterward.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ai/chat/route.ts
git commit -m "feat: add AI chat API route with tool-calling loop"
```

---

### Task 4: AI chat widget UI

**Files:**
- Create: `src/components/shared/AIChatWidget.tsx`
- Modify: `src/app/(dashboard)/layout-client.tsx`

**Interfaces:**
- Consumes: `POST /api/ai/chat` (Task 3).
- Produces: `<AIChatWidget />` — no props (self-detects case id from `usePathname()`). Mounted once in `layout-client.tsx`.

- [ ] **Step 1: Write the widget component**

Create `src/components/shared/AIChatWidget.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function detectCaseId(pathname: string): string | undefined {
  const match = pathname.match(/^\/cases\/([^/]+)/);
  return match ? match[1] : undefined;
}

export default function AIChatWidget() {
  const pathname = usePathname();
  const caseId = detectCaseId(pathname);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, caseId }),
      });

      if (res.status === 503) {
        setError('AI assistant not configured.');
        return;
      }
      if (!res.ok) {
        setError('AI assistant request failed. Try again.');
        return;
      }

      const text = await res.text();
      setMessages([...nextMessages, { role: 'assistant', content: text }]);
    } catch {
      setError('AI assistant request failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 h-96 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-900 text-white">
            <span className="text-xs font-bold tracking-wide">Caseline AI</span>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-[11px] text-slate-400">
                Ask about cases, criminals, officers, evidence, or investigations
                {caseId ? ' — currently viewing this case.' : '.'}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-xs rounded-lg px-2.5 py-1.5 max-w-[85%] whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white ml-auto'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.content}
              </div>
            ))}
            {error && <p className="text-[11px] text-red-500">{error}</p>}
          </div>

          <div className="border-t border-slate-100 p-2 flex items-center space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask the AI assistant..."
              className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-1.5 rounded-lg bg-slate-900 text-white disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
      >
        <Bot className="w-5 h-5" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Mount the widget in the dashboard layout**

Edit `src/app/(dashboard)/layout-client.tsx`:

Add the import near the other imports:

```typescript
import AIChatWidget from '@/components/shared/AIChatWidget';
```

Add `<AIChatWidget />` just before the closing `</div>` of the outer container (after the "Main Workspace Frame" div, still inside the root `flex` div):

```typescript
      </div>

      <AIChatWidget />

    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `AIChatWidget.tsx` or `layout-client.tsx`

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`, open `http://localhost:3000/dashboard`, log in.
- Confirm the chat bubble appears bottom-right on every dashboard page.
- Click it open, ask "How many cases are critical priority?" — confirm a real number comes back (cross-check against `/analytics` or `/dashboard` stats).
- Ask "List wanted criminals" — confirm names match `/criminals` page filtered by status.
- Navigate to a specific case detail page (`/cases/<id>`), open the widget, ask "Summarize this case" — confirm it answers about the correct case without you stating the id.
- With `GROQ_API_KEY` unset (from Task 3 Step 4), confirm the widget shows "AI assistant not configured." instead of crashing.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/AIChatWidget.tsx "src/app/(dashboard)/layout-client.tsx"
git commit -m "feat: add floating AI chat widget to dashboard"
```

---

## Post-plan verification

- [ ] Run `npm run lint` — expect no new errors introduced by AI files.
- [ ] Run `npx tsc --noEmit` — expect zero errors project-wide.
- [ ] Full manual pass through Task 4 Step 4 scenarios one more time end-to-end.
