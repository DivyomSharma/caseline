// Curated subset of Bharatiya Nyaya Sanhita (BNS) sections commonly cited in
// the demo's case types, with the IPC section each replaced (BNS/BNSS/BSA
// came into force 1 July 2024, replacing IPC/CrPC/Evidence Act).
//
// Section numbers here are best-effort from public reporting at the time of
// the criminal-law transition, not a verified legal database — every entry
// links to India Code so an officer can confirm the exact text before citing
// it. The AI copilot must retrieve from this list rather than inventing
// section numbers/text (see PRD §5.2).

export interface LegalSection {
  id: string;
  act: 'BNS';
  sectionNumber: string;
  title: string;
  summary: string;
  oldLawAct: 'IPC';
  oldLawSection: string;
  sourceUrl: string;
}

export const ACTS = [
  { code: 'BNS', name: 'Bharatiya Nyaya Sanhita, 2023', inForceFrom: '2024-07-01', replaces: 'IPC, 1860' },
  { code: 'BNSS', name: 'Bharatiya Nagarik Suraksha Sanhita, 2023', inForceFrom: '2024-07-01', replaces: 'CrPC, 1973' },
  { code: 'BSA', name: 'Bharatiya Sakshya Adhiniyam, 2023', inForceFrom: '2024-07-01', replaces: 'Indian Evidence Act, 1872' },
];

export const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: 'bns-103',
    act: 'BNS',
    sectionNumber: '103',
    title: 'Murder',
    summary: 'Culpable homicide amounting to murder; punishment provisions for intentional killing.',
    oldLawAct: 'IPC',
    oldLawSection: '302',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-115',
    act: 'BNS',
    sectionNumber: '115',
    title: 'Voluntarily causing hurt',
    summary: 'Whoever voluntarily causes hurt to any person.',
    oldLawAct: 'IPC',
    oldLawSection: '323',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-118',
    act: 'BNS',
    sectionNumber: '118',
    title: 'Voluntarily causing grievous hurt',
    summary: 'Grievous hurt caused voluntarily, including by dangerous weapons or means.',
    oldLawAct: 'IPC',
    oldLawSection: '325/326',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-303',
    act: 'BNS',
    sectionNumber: '303',
    title: 'Theft',
    summary: 'Dishonestly taking movable property out of the possession of another without consent.',
    oldLawAct: 'IPC',
    oldLawSection: '378/379',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-308',
    act: 'BNS',
    sectionNumber: '308',
    title: 'Extortion',
    summary: 'Intentionally putting a person in fear of injury to dishonestly induce delivery of property.',
    oldLawAct: 'IPC',
    oldLawSection: '383/384',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-309',
    act: 'BNS',
    sectionNumber: '309',
    title: 'Robbery',
    summary: 'Theft or extortion committed with force, or the threat of instant hurt/wrongful restraint.',
    oldLawAct: 'IPC',
    oldLawSection: '392',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-311',
    act: 'BNS',
    sectionNumber: '311',
    title: 'Dacoity',
    summary: 'Robbery committed by five or more persons acting in concert.',
    oldLawAct: 'IPC',
    oldLawSection: '395',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-318',
    act: 'BNS',
    sectionNumber: '318',
    title: 'Cheating',
    summary: 'Fraudulently or dishonestly inducing a person to deliver property or do/omit an act.',
    oldLawAct: 'IPC',
    oldLawSection: '420',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-331',
    act: 'BNS',
    sectionNumber: '331',
    title: 'House-breaking / lurking house-trespass',
    summary: 'Trespass into a building used as a human dwelling, by breaking, at night or otherwise.',
    oldLawAct: 'IPC',
    oldLawSection: '449/454/457',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
  {
    id: 'bns-351',
    act: 'BNS',
    sectionNumber: '351',
    title: 'Criminal intimidation',
    summary: 'Threatening a person with injury to person, reputation, or property to cause alarm.',
    oldLawAct: 'IPC',
    oldLawSection: '506',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
  },
];

export function searchLegalSections(query?: string): LegalSection[] {
  if (!query) return LEGAL_SECTIONS;
  const q = query.toLowerCase();
  return LEGAL_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.sectionNumber.includes(q) ||
      s.oldLawSection.toLowerCase().includes(q)
  );
}

export function getLegalSectionById(id: string): LegalSection | null {
  return LEGAL_SECTIONS.find((s) => s.id === id) ?? null;
}
