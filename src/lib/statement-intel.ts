// Lightweight heuristic discrepancy detector for witness statements — flags
// candidate timeline conflicts (different clock times mentioned) and vehicle
// plate mismatches across statements on the same case. This is a keyword/regex
// heuristic, not an AI judgement of truthfulness: it surfaces "these two
// statements mention different times/plates" for a human to review, per the
// project's rule that AI/heuristics flag gaps rather than decide facts.

export interface Statement {
  id: string;
  witness_name: string;
  statement_text: string;
  recorded_date: string;
}

export interface Discrepancy {
  type: 'time' | 'vehicle';
  statementAId: string;
  statementBId: string;
  witnessA: string;
  witnessB: string;
  valueA: string;
  valueB: string;
}

const TIME_RE = /\b(\d{1,2})(?::(\d{2}))?\s?(am|pm|AM|PM)\b/g;
const PLATE_RE = /\b[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{3,4}\b/g;

function toMinutes(hour: string, minute: string | undefined, meridiem: string): number {
  let h = parseInt(hour, 10) % 12;
  if (meridiem.toLowerCase() === 'pm') h += 12;
  return h * 60 + (minute ? parseInt(minute, 10) : 0);
}

function extractTimes(text: string): { raw: string; minutes: number }[] {
  const matches = [...text.matchAll(TIME_RE)];
  return matches.map((m) => ({ raw: m[0], minutes: toMinutes(m[1], m[2], m[3]) }));
}

function extractPlates(text: string): string[] {
  return [...new Set((text.match(PLATE_RE) || []).map((p) => p.replace(/[\s-]/g, '').toUpperCase()))];
}

export function findStatementDiscrepancies(statements: Statement[]): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];

  for (let i = 0; i < statements.length; i++) {
    for (let j = i + 1; j < statements.length; j++) {
      const a = statements[i];
      const b = statements[j];

      const timesA = extractTimes(a.statement_text);
      const timesB = extractTimes(b.statement_text);
      for (const ta of timesA) {
        for (const tb of timesB) {
          const diff = Math.abs(ta.minutes - tb.minutes);
          if (diff >= 20 && diff <= 12 * 60) {
            discrepancies.push({
              type: 'time',
              statementAId: a.id,
              statementBId: b.id,
              witnessA: a.witness_name,
              witnessB: b.witness_name,
              valueA: ta.raw,
              valueB: tb.raw,
            });
          }
        }
      }

      const platesA = extractPlates(a.statement_text);
      const platesB = extractPlates(b.statement_text);
      for (const pa of platesA) {
        for (const pb of platesB) {
          if (pa !== pb) {
            discrepancies.push({
              type: 'vehicle',
              statementAId: a.id,
              statementBId: b.id,
              witnessA: a.witness_name,
              witnessB: b.witness_name,
              valueA: pa,
              valueB: pb,
            });
          }
        }
      }
    }
  }

  return discrepancies;
}
