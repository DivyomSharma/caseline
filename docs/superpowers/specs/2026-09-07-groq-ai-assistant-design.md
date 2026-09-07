# Groq AI Assistant — Design Spec

## Problem

Caseline (police CRMS, Next.js + Supabase) has no AI capability. Officers/admins need
a way to query case data in natural language without manually navigating tables/filters,
and to get case summarization / investigation suggestions.

## Goals

- Native chat assistant powered by Groq (`llama-3.3-70b-versatile`), streamed responses.
- Assistant has access to *all* case data via tool-calling against the existing
  `src/lib/supabase/db.ts` read functions — not a static context dump, so it scales
  as the dataset grows and always reflects current DB state.
- Phase 1: per-case copilot (context-aware when viewing a case). Phase 2: global
  natural-language query assistant (cross-case questions, stats, pattern lookups).
- Same data access as the rest of the app today — no new role/station scoping added.
  (Existing RLS is `using (true)` for all reads; this feature does not change that
  posture. See "Known gap" below.)

## Non-goals

- No new RLS/authorization model. Fixing the wide-open RLS policies is a separate,
  pre-existing issue (see audit notes) and out of scope here.
- No persisted chat history / conversation storage in this phase.
- No write actions via AI (no case creation/updates through chat) in this phase.

## Architecture

### Groq client
- `src/lib/ai/groq.ts` — thin wrapper, reads `GROQ_API_KEY` from env, exports a
  configured Groq client (via `groq-sdk`).

### Tools
- `src/lib/ai/tools.ts` — tool/function definitions (JSON schema) mapping to existing
  `db.ts` exports:
  - `getCases`, `getCaseById`, `getCriminals`, `getCriminalById`, `getOfficers`,
    `getOfficerById`, `getVictims`, `getFIRs`, `getPoliceStations`,
    `getAllEvidence`, `getAllInvestigations`, `getDashboardStats`.
  - Each tool wraps the existing function 1:1 — no new query logic, no duplicate
    data-access paths.

### Chat loop
- `src/app/api/ai/chat/route.ts` — POST endpoint.
  - Request body: `{ messages: {role, content}[], caseId?: string }`.
  - Builds system prompt: brief schema overview + (if `caseId` present) a note that
    the user is currently viewing that case.
  - Calls Groq with `tools` attached. If the model returns tool calls, the route
    executes the corresponding `db.ts` function server-side, appends the tool result
    as a message, and loops back to Groq. Capped at 5 iterations to prevent runaway
    loops.
  - Final assistant response is streamed back to the client (SSE / chunked text).
  - Tool execution errors (e.g. case not found) are returned to the model as a tool
    result string, not thrown — lets the model self-correct in its answer instead of
    the request failing.

### UI
- `src/components/shared/AIChatWidget.tsx` — floating chat bubble, mounted once in
  `src/app/(dashboard)/layout.tsx` so it's present on every dashboard route.
  - Collapsed: icon bubble, bottom-right.
  - Expanded: chat panel, message list + input, streamed tokens rendered as they
    arrive.
  - On case detail pages (`(dashboard)/cases/[id]/case-detail-client.tsx`), the
    widget is passed the current `caseId` as a prop, which the route uses to seed
    context.
  - Message history is client-side React state only — lost on refresh/navigation
    away (acceptable for phase 1; see future scope).

### Env / config
- New required env var: `GROQ_API_KEY`.
- If unset, `/api/ai/chat` returns a clear error and the widget renders in a
  disabled state ("AI assistant not configured") instead of crashing or silently
  failing.

## Data flow

1. User submits a message in the widget (optionally on a case page → `caseId` sent).
2. Client POSTs full message history to `/api/ai/chat`.
3. Server builds system prompt, calls Groq with tool defs attached.
4. Tool-call loop (0–5 iterations) resolves any data the model requests via existing
   `db.ts` functions.
5. Final text streamed to client, appended to the visible chat.

## Error handling

- Missing `GROQ_API_KEY` → widget disabled, no crash.
- Groq API failure (rate limit, network) → widget shows inline error message,
  input remains usable for retry.
- Tool call against nonexistent id → error string fed back to model, not a thrown
  exception.
- Loop cap (5 iterations) prevents infinite tool-calling; if hit, the last partial
  answer is returned with a note that the search was truncated.

## Testing

- Manual verification via the running app:
  - Ask cross-table questions ("how many cases are critical priority", "list wanted
    criminals", "which station has the most open cases") — confirm correct tool
    calls fire and answers match DB state.
  - Open a case detail page, ask "summarize this case" — confirm `caseId` context is
    used without the user restating the case number.
  - Unset `GROQ_API_KEY` — confirm widget shows disabled state, rest of app
    unaffected.

## Known gap (pre-existing, not fixed by this feature)

Current RLS policies (`supabase/schema.sql`) grant `select using (true)` on every
table to any authenticated user, regardless of role or station. The AI assistant
inherits this same access level via the tool-calling layer (calls the same `db.ts`
functions the rest of the app already calls). This spec does not change that
posture — flagged here so it isn't mistaken for a new exposure introduced by this
feature.

## Future scope

See separate section delivered in conversation — role-scoped AI context, persisted
conversation history, write-capable actions (draft FIR, log investigation update via
chat), proactive case-pattern alerts, voice input, multi-case cross-referencing
("find criminals linked to 2+ open cases"), report generation via chat, RAG over
uploaded evidence documents, audit trail of AI-assisted decisions.
