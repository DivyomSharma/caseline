# CaseLine — Product Requirements Document

**Status:** Draft v1
**Date:** 2026-09-13
**Author:** Divyom Sharma (with Claude)

---

## 1. What CaseLine is

A simulated Delhi Police case-management platform. Fictional operational data (cases,
FIRs, criminals, evidence) sits on top of a **real Delhi Police organisational
structure**, **real BNS/BNSS/BSA legal corpus**, and **real public government
datasets** (NCRB Crime in India, CPCB AQI, etc.), with an AI copilot that reasons
over the case DB via tool-calling. Goal: read as one coherent government-grade
intelligence system, not ten unrelated CRUD screens with a chatbot bolted on.

Explicitly **not** building: recidivism scoring, bail recommendation, suspicion
scores, face-recognition watchlists, or any AI system that decides guilt/action.
AI only retrieves, summarises, compares, and flags gaps — humans decide.

---

## 2. Current state (as of this repo, main @ 4770df9)

**Stack:** Next.js 15 (App Router, Turbopack) · React 19 · Supabase (Postgres +
Auth) · Tailwind v4 · Groq SDK (`llama-3.3-70b-versatile`) · Recharts · Zod.

**Implemented:**
- Auth: Supabase email/password, `(auth)/login`, cookie-gated middleware.
- Dashboard shell: sidebar nav, layout, dashboard summary cards.
- CRUD-ish pages: `cases`, `fir`, `criminals`, `victims`, `officers`, `stations`,
  `investigations`, `evidence`, `reports`, `analytics`, `settings`.
- DB schema (`supabase/schema.sql`): profiles, police_stations, officers,
  victims, cases, firs, criminals, case_criminals, case_victims,
  investigations, evidence, case_updates. Flat, single-tenant, no station
  scoping in RLS.
- AI assistant: `/api/ai/chat` route, Groq function-calling loop over 13 read
  tools (`src/lib/ai/tools.ts`) wrapping existing `db.ts` queries. Chat widget
  mounted globally. Offline mock fallback when `GROQ_API_KEY` absent.

**Known blockers (carried from prior session, unresolved):**
1. **Auth bypass in offline mode** — `middleware.ts` gates routes on presence
   of a `caseline_session` cookie only; value is never verified against a
   server session when Supabase env vars are absent. Anyone can set the
   cookie client-side and reach every route.
2. **RLS wide open** — every table's select policy is `using (true)`. Any
   authenticated user reads all cases/criminals/evidence across every
   station/district. No station- or role-scoped row access anywhere.

These are **pre-ship blockers**, independent of new scope below — see §6.

---

## 3. Gap analysis: current build vs. the full vision

| Vision area | Current state | Gap |
|---|---|---|
| Org structure (ranges/districts/PS) | `police_stations` flat table, `district: text` free field | No range/district hierarchy table, no real Delhi PS names/codes seeded |
| Legal corpus (BNS/BNSS/BSA) | Not modelled | No `acts`/`legal_sections` tables, no section linkage to cases |
| Case Workspace (timeline, people, evidence, court tabs) | Separate flat pages per entity | No unified per-case workspace UI; no timeline model |
| Evidence chain of custody | `evidence` table has status enum only | No `evidence_transfers`, no hash/seal/custody trail |
| Smart FIR assistant (NL → structured extraction) | Not built | New AI feature, needs a dedicated tool + review-before-save UX |
| Statement Intelligence (discrepancy detection) | Not built | New table (`statements`) + AI comparison feature |
| Delhi crime map / Bhuvan / CPCB layers | Not built | New map page, external API integration |
| Entity/relationship graph | Not built | New page, React Flow, derived from existing joins |
| Court tracker | Not built | New `court_cases`/`hearings`/`court_orders` tables |
| Government dataset provenance (`data_sources`) | Not built | New table + badge component, used to visually separate real vs synthetic data |
| Role-based dashboards per role | Single `role` enum (admin/officer/viewer), no per-role dashboard variation | Dashboard content doesn't change by role today |
| Immutable audit log | `case_updates` exists but is a free-text log, not a field-level diff audit | Needs real audit trigger capturing old/new values |
| AI copilot | Read-only tool-calling over current tables — solid foundation | Needs to extend to new tables as they land; needs citation format for legal answers |

**Read on this:** the vision doc describes a 2-3 semester capstone. The existing
repo is a working slice (~15% of scope: auth, basic CRUD, one AI feature). This
PRD scopes what ships next in priority order, not the whole vision at once.

---

## 4. Goals for this PRD's scope

1. Close the two pre-ship security blockers (§6) — always first, regardless of
   what feature work follows.
2. Give the fictional data a real backbone: Delhi org hierarchy + real BNS
   section references, so every other feature has correct data to point at.
3. Turn the flat per-entity pages into one **Case Workspace** — the single
   highest-leverage UI change per the vision doc ("hero of the project").
4. Extend the AI copilot to use the new structure (legal citations, case
   workspace Q&A) rather than bolting on a second unrelated AI feature.
5. Add the provenance/badge system as soon as any real government dataset is
   pulled in — never let synthetic and real data look the same.

Explicitly out of scope for this PRD (revisit after §4 ships): Bhuvan/CPCB map
layers, court e-filing style tracker, Statement Intelligence, entity graph
visualisation. These are additive UI features with no dependency on the data
model changes below, so they're independently schedulable later.

---

## 5. Functional requirements

### 5.1 Delhi org structure (data + UI)
- New tables: `ranges` (Eastern/Northern/Central/Southern/Western/New Delhi),
  `districts` (15 territorial + specialised), replacing `police_stations.district: text`
  with `district_id` FK.
- Seed real district → range mapping and a representative set of real PS names
  per district (from Delhi Police public RTI manual data — not the full 226,
  a representative ~30-40 for demo density).
- New `/stations` view: hierarchy tree (Range → District → Station), not flat list.
- Acceptance: selecting a range filters districts; selecting a district filters
  stations and cases; dashboard stat cards respect the selected scope.

### 5.2 Legal corpus (BNS/BNSS/BSA)
- New tables: `acts` (BNS/BNSS/BSA/IPC/CrPC/Evidence Act — old+new for the
  transition-period feature), `legal_sections` (act_id, section_number, title,
  body_text, source_url), `case_sections` (case_id, section_id).
- Seed a curated subset of commonly-cited BNS sections (theft, robbery,
  assault, cheating, etc.) with real section numbers/text from India Code —
  not the full corpus; enough for the demo's case types.
- New `/laws` page: browse/search sections, each shows source citation +
  link to official India Code text.
- AI copilot rule: **legal answers must retrieve from `legal_sections` first**,
  then explain in NL. Never let the model invent section text. Tool:
  `searchLegalSections(query)`.

### 5.3 Case Workspace (replaces flat per-entity browsing for case-scoped data)
- New route `/cases/[id]` with tabs: Overview, Timeline, People, Evidence,
  Statements (stub), Court (stub), Tasks, Documents, Audit.
- Timeline tab renders from existing `investigations` + `case_updates` +
  new `case_sections`/evidence events, chronologically — this is the model
  described in the vision doc (FIR → assignment → evidence → charge sheet →
  hearings), built from data already collected rather than a new engine.
- AI panel embedded in the workspace: "What's missing in this case?" using
  case-scoped tool calls (`getCaseById`, `getAllEvidence` filtered, plus new
  `searchLegalSections`).
- Acceptance: existing `/cases` list links into `/cases/[id]` instead of (or
  in addition to) the current flat detail view.

### 5.4 Provenance badges
- New table `data_sources` (name, agency, source_url, license, last_synced,
  is_live) — seeded manually for now (org structure = "Delhi Police public
  data", legal sections = "India Code", everything else = "CaseLine demo data").
- Shared `<ProvenanceBadge>` component, three variants: Government Data /
  Public Court Data / CaseLine Demo Data. Applied to org structure page and
  laws page first; extended as real datasets are added later.

### 5.5 AI copilot extension
- Add tools: `searchLegalSections`, `getCaseSections`, `getOrgHierarchy`.
- System prompt updated: cite `data_sources`/`legal_sections` provenance in
  any answer touching law or org structure; never fabricate a section number.
- Keep existing 13 tools as-is.

---

## 6. Non-negotiable fixes (before any of the above ships to a shared/demo environment)

1. **Fix offline-mode auth bypass.** Either remove the offline mock-auth path
   entirely for anything beyond local dev, or verify the session cookie
   against a real server-side session store (signed cookie at minimum) rather
   than checking for presence only.
2. **Fix RLS.** Replace `using (true)` read policies with station/role-scoped
   policies: officers see their station's district (or assigned cases);
   admins see all; viewers get a restricted read set. This blocks §5.1's
   district scoping from being meaningful otherwise.

These are correctness/security requirements, not "nice to have" — ship blockers
regardless of which feature work above is prioritized.

---

## 7. Data model additions (net new tables for this PRD's scope)

```
ranges            (id, name)
districts         (id, name, range_id)
-- police_stations gains district_id FK, drops district:text

acts              (id, name, short_code, in_force_from, in_force_to)
legal_sections    (id, act_id, section_number, title, body_text, source_url)
case_sections     (case_id, section_id)

data_sources      (id, name, agency, source_url, license, last_synced, is_live)
```

No changes to existing tables beyond `police_stations.district_id`.

---

## 8. Sequencing

1. Security fixes (§6) — blocking, do first.
2. `ranges`/`districts` + seed data + `/stations` hierarchy UI (§5.1).
3. `acts`/`legal_sections`/`case_sections` + seed + `/laws` page (§5.2).
4. Case Workspace `/cases/[id]` (§5.3) — depends on §5.2 for the sections tab.
5. Provenance badges (§5.4) — small, can land alongside 2-3.
6. AI copilot tool additions (§5.5) — depends on 2-4 existing.

Everything in §4's "out of scope" list (map layers, court tracker, statement
intelligence, entity graph) is picked up after this sequence, each as its own
PRD slice since none blocks the others.

---

## 9. Open questions for the user

- Seed data volume: how many synthetic cases/criminals for the demo (vision
  doc suggests 1,000-10,000)? Affects whether seeding is a script or manual SQL.
- Is Supabase Auth staying, or moving to a different provider mentioned
  nowhere in current code? (Assumed: staying, since it's already wired.)
- Priority: does the user want Case Workspace before or after the legal
  corpus, if time is constrained? (This PRD sequences legal corpus first
  because Workspace's Legal tab depends on it — flag if that's wrong.)
