# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Delhi Police personnel across roles: Commissioner/Additional Commissioner (admin),
Station House Officers and Inspectors (officer), Director General/oversight
(viewer). Used in an operational case-management context — registering FIRs,
tracking investigations, managing evidence and criminal records, court dates.

## Product Purpose

CaseLine is a simulated Delhi Police case-management platform. Fictional
operational data (cases, FIRs, criminals, evidence) sits on a real Delhi
Police organisational structure, real BNS/BNSS/BSA legal corpus, and real
public government datasets (NCRB, CPCB AQI). Success = reads as one coherent
government-grade intelligence system, not disconnected CRUD screens with a
chatbot bolted on. An AI copilot retrieves/summarises/compares over the case
DB via tool-calling; it never scores, recommends, or decides — humans decide.

## Positioning

Not a generic CRUD admin panel — a government-grade case intelligence system
that unifies real legal/organisational data with an auditable AI copilot,
scoped explicitly to retrieval/summarization (no scoring, no suspicion
ranking, no decisioning).

## Operating Context

Workflows: FIR registration, case investigation logging, evidence
chain-of-custody, criminal records, court tracking, officer/station
directory, role-scoped dashboards, AI chat assistant grounded in the case DB.

## Capabilities and Constraints

- Stack: Next.js 15 (App Router), React 19, Supabase (Postgres + Auth),
  Tailwind v4, Groq SDK, Recharts, Zod.
- Offline mock-data fallback mode when Supabase/Groq env vars are absent.
- Roles: admin, officer, viewer — single flat role enum today, no per-role
  dashboard variation yet.
- AI is read-only tool-calling; explicitly excludes recidivism scoring, bail
  recommendation, suspicion scores, and face-recognition watchlists.

## Brand Commitments

Name: CaseLine. No existing binding visual identity — current UI is an
unstyled first pass. User has directed a full visual-identity redesign
using uidai.gov.in (Aadhaar/UIDAI, Government of India) as the reference
world: navy/tricolor palette, serif display type, pill nav and CTAs.

## Evidence on Hand

Seeded demo data (Delhi Police stations, officers, cases, criminals) in
`supabase/seed.sql` and `src/lib/supabase/seedData.ts`. Real legal corpus
(BNS/BNSS/BSA sections) in `src/lib/legal-sections.ts`. No real user
research or testimonials — this is a solo capstone-style project.

## Product Principles

- Coherence over decoration: every real-data source (legal corpus, org
  structure, public datasets) must be visually distinguishable from
  synthetic/demo data (provenance badges).
- AI stays a retrieval/summarization tool, never a decision-maker — this
  must be legible in the UI, not just the backend logic.
- Government-grade seriousness: the visual identity should read as an
  official, trustworthy system of record, not a consumer SaaS dashboard.

## Accessibility & Inclusion

No formal standard confirmed yet; treat WCAG AA as the working default
given the government-system positioning.
