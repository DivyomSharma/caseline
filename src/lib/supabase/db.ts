import { createClient as createServerSupabase } from './server';
import { createClient as createBrowserSupabase } from './client';
import * as seedData from './seedData';
import { Case, Criminal } from './seedData';

// -------------------------------------------------------------------------
// DUAL-MODE CHECK & STATE IN-MEMORY FOR LOCAL DATABASE CACHE ENGINE
// -------------------------------------------------------------------------

const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// Global server memory store for local memory database cache
const globalStore = globalThis as any;
if (!globalStore.mockDb) {
  globalStore.mockDb = {
    stations: JSON.parse(JSON.stringify(seedData.STATIONS)),
    profiles: JSON.parse(JSON.stringify(seedData.PROFILES)),
    officers: JSON.parse(JSON.stringify(seedData.OFFICERS)),
    victims: JSON.parse(JSON.stringify(seedData.VICTIMS)),
    cases: JSON.parse(JSON.stringify(seedData.CASES)),
    firs: JSON.parse(JSON.stringify(seedData.FIRS)),
    criminals: JSON.parse(JSON.stringify(seedData.CRIMINALS)),
    case_criminals: JSON.parse(JSON.stringify(seedData.CASE_CRIMINALS)),
    case_victims: JSON.parse(JSON.stringify(seedData.CASE_VICTIMS)),
    investigations: JSON.parse(JSON.stringify(seedData.INVESTIGATIONS)),
    evidence: JSON.parse(JSON.stringify(seedData.EVIDENCE)),
    case_updates: JSON.parse(JSON.stringify(seedData.CASE_UPDATES))
  };
}

export async function getDatabaseSlateMode(): Promise<'seeded' | 'empty'> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const mode = cookieStore.get('caseline_db_slate')?.value || 'seeded';
      globalStore.mockDbMode = mode;
      return mode as 'seeded' | 'empty';
    } catch {
      return (globalStore.mockDbMode || 'seeded') as 'seeded' | 'empty';
    }
  } else {
    const match = document.cookie.match(new RegExp('(^| )caseline_db_slate=([^;]*)'));
    const mode = (match ? decodeURIComponent(match[2]) : 'seeded') as 'seeded' | 'empty';
    globalStore.mockDbMode = mode;
    return mode;
  }
}

export async function setDatabaseSlateMode(mode: 'seeded' | 'empty') {
  globalStore.mockDbMode = mode;
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      cookieStore.set('caseline_db_slate', mode, { path: '/' });
    } catch (e) {
      console.error("Failed to set slate mode cookie:", e);
    }
  } else {
    document.cookie = `caseline_db_slate=${mode}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }
}

export async function resetEmptySlate() {
  globalStore.mockDbEmpty = null;
}

const mockDb = new Proxy({} as any, {
  get(target, prop) {
    const mode = globalStore.mockDbMode || 'seeded';
    if (mode === 'empty') {
      if (!globalStore.mockDbEmpty) {
        globalStore.mockDbEmpty = {
          stations: [],
          profiles: JSON.parse(JSON.stringify(seedData.PROFILES)),
          officers: JSON.parse(JSON.stringify(seedData.OFFICERS.filter((o: any) => o.profile_id === 'user-divyom' || o.profile_id === 'user-samar'))),
          victims: [],
          cases: [],
          firs: [],
          criminals: [],
          case_criminals: [],
          case_victims: [],
          investigations: [],
          evidence: [],
          case_updates: []
        };
      }
      return globalStore.mockDbEmpty[prop];
    }
    return globalStore.mockDb[prop];
  },
  set(target, prop, value) {
    const mode = globalStore.mockDbMode || 'seeded';
    if (mode === 'empty') {
      if (!globalStore.mockDbEmpty) {
        globalStore.mockDbEmpty = {
          stations: [],
          profiles: JSON.parse(JSON.stringify(seedData.PROFILES)),
          officers: JSON.parse(JSON.stringify(seedData.OFFICERS.filter((o: any) => o.profile_id === 'user-divyom' || o.profile_id === 'user-samar'))),
          victims: [],
          cases: [],
          firs: [],
          criminals: [],
          case_criminals: [],
          case_victims: [],
          investigations: [],
          evidence: [],
          case_updates: []
        };
      }
      globalStore.mockDbEmpty[prop] = value;
      return true;
    }
    globalStore.mockDb[prop] = value;
    return true;
  }
});

// Helper to get cookies in server actions/components safely
const getSessionCookie = async () => {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('caseline_session')?.value;
  } else {
    // Basic client cookies parser
    const match = document.cookie.match(new RegExp('(^| )caseline_session=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : undefined;
  }
};

// -------------------------------------------------------------------------
// AUTH FUNCTIONS
// -------------------------------------------------------------------------

export async function getCurrentUser() {
  await getDatabaseSlateMode();
  if (!isSupabaseConfigured()) {
    const sessionEmail = await getSessionCookie();
    if (!sessionEmail) return null;

    const profile = mockDb.profiles.find((p: any) => p.email === sessionEmail);
    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url
    };
  }

  try {
    const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch matching profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      full_name: profile?.full_name || 'User',
      role: (profile?.role || 'viewer') as 'admin' | 'officer' | 'viewer',
      avatar_url: profile?.avatar_url || ''
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

// -------------------------------------------------------------------------
// POLICE STATIONS
// -------------------------------------------------------------------------

export async function getPoliceStations() {
  if (!isSupabaseConfigured()) {
    return mockDb.stations;
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase.from('police_stations').select('*').order('name');
  return data || [];
}

export async function getPoliceStationById(id: string) {
  if (!isSupabaseConfigured()) {
    return mockDb.stations.find((s: any) => s.id === id) || null;
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase.from('police_stations').select('*').eq('id', id).single();
  return data || null;
}

// -------------------------------------------------------------------------
// OFFICERS
// -------------------------------------------------------------------------

export async function getOfficers() {
  if (!isSupabaseConfigured()) {
    // Join with profiles and stations
    return mockDb.officers.map((off: any) => {
      const profile = mockDb.profiles.find((p: any) => p.id === off.profile_id);
      const station = mockDb.stations.find((s: any) => s.id === off.station_id);
      return {
        ...off,
        profiles: profile,
        police_stations: station
      };
    });
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase
    .from('officers')
    .select('*, profiles(*), police_stations(*)');
  return data || [];
}

export async function getOfficerById(id: string) {
  if (!isSupabaseConfigured()) {
    const off = mockDb.officers.find((o: any) => o.id === id);
    if (!off) return null;
    const profile = mockDb.profiles.find((p: any) => p.id === off.profile_id);
    const station = mockDb.stations.find((s: any) => s.id === off.station_id);
    return {
      ...off,
      profiles: profile,
      police_stations: station
    };
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase
    .from('officers')
    .select('*, profiles(*), police_stations(*)')
    .eq('id', id)
    .single();
  return data || null;
}

// -------------------------------------------------------------------------
// CASES
// -------------------------------------------------------------------------

export async function getCases(filters?: {
  search?: string;
  status?: string;
  priority?: string;
  stationId?: string;
  officerId?: string;
}) {
  if (!isSupabaseConfigured()) {
    let result = mockDb.cases.map((c: any) => {
      const station = mockDb.stations.find((s: any) => s.id === c.station_id);
      const officer = mockDb.officers.find((o: any) => o.id === c.assigned_officer_id);
      const officerProfile = officer ? mockDb.profiles.find((p: any) => p.id === officer.profile_id) : null;
      // Get linked FIR
      const fir = mockDb.firs.find((f: any) => f.case_id === c.id);
      return {
        ...c,
        police_stations: station,
        officers: officer ? { ...officer, profiles: officerProfile } : null,
        firs: fir ? [fir] : []
      };
    });

    if (filters) {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        result = result.filter((c: any) => 
          c.case_number.toLowerCase().includes(s) ||
          c.crime_type.toLowerCase().includes(s) ||
          c.location.toLowerCase().includes(s) ||
          (c.officers?.profiles?.full_name || '').toLowerCase().includes(s) ||
          (c.firs?.[0]?.fir_number || '').toLowerCase().includes(s)
        );
      }
      if (filters.status) {
        result = result.filter((c: any) => c.status === filters.status);
      }
      if (filters.priority) {
        result = result.filter((c: any) => c.priority === filters.priority);
      }
      if (filters.stationId) {
        result = result.filter((c: any) => c.station_id === filters.stationId);
      }
      if (filters.officerId) {
        result = result.filter((c: any) => c.assigned_officer_id === filters.officerId);
      }
    }

    // Sort by incident_date desc
    return result.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  let query = supabase
    .from('cases')
    .select('*, police_stations(*), officers(*, profiles(*)), firs(*)');

  if (filters) {
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.stationId) query = query.eq('station_id', filters.stationId);
    if (filters.officerId) query = query.eq('assigned_officer_id', filters.officerId);
    if (filters.search) {
      // Basic text search. PostgreSQL full text or simple OR is cleaner.
      // We will perform client-side filtering if search query is present to be robust
    }
  }

  const { data } = await query.order('created_at', { ascending: false });
  let result = data || [];

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter((c: any) => 
      c.case_number.toLowerCase().includes(s) ||
      c.crime_type.toLowerCase().includes(s) ||
      c.location.toLowerCase().includes(s) ||
      (c.officers?.profiles?.full_name || '').toLowerCase().includes(s) ||
      (c.firs?.[0]?.fir_number || '').toLowerCase().includes(s)
    );
  }

  return result;
}

export async function getCaseById(id: string) {
  if (!isSupabaseConfigured()) {
    const c = mockDb.cases.find((x: any) => x.id === id);
    if (!c) return null;

    const station = mockDb.stations.find((s: any) => s.id === c.station_id);
    const officer = mockDb.officers.find((o: any) => o.id === c.assigned_officer_id);
    const officerProfile = officer ? mockDb.profiles.find((p: any) => p.id === officer.profile_id) : null;
    const fir = mockDb.firs.find((f: any) => f.case_id === c.id);
    
    // Get investigations
    const caseInvestigations = mockDb.investigations
      .filter((i: any) => i.case_id === c.id)
      .map((inv: any) => {
        const o = mockDb.officers.find((x: any) => x.id === inv.officer_id);
        const p = o ? mockDb.profiles.find((pr: any) => pr.id === o.profile_id) : null;
        return { ...inv, officers: o ? { ...o, profiles: p } : null };
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Get evidence
    const caseEvidence = mockDb.evidence
      .filter((e: any) => e.case_id === c.id)
      .map((ev: any) => {
        const o = mockDb.officers.find((x: any) => x.id === ev.collected_by);
        const p = o ? mockDb.profiles.find((pr: any) => pr.id === o.profile_id) : null;
        return { ...ev, officers: o ? { ...o, profiles: p } : null };
      });

    // Get victims
    const linkedVictimIds = mockDb.case_victims
      .filter((cv: any) => cv.case_id === c.id)
      .map((cv: any) => cv.victim_id);
    const caseVictims = mockDb.victims.filter((v: any) => linkedVictimIds.includes(v.id));

    // Get criminals
    const linkedCriminalJoins = mockDb.case_criminals.filter((cc: any) => cc.case_id === c.id);
    const caseCriminals = linkedCriminalJoins.map((cc: any) => {
      const crim = mockDb.criminals.find((cr: any) => cr.id === cc.criminal_id);
      return {
        ...crim,
        relationship_status: cc.relationship_status
      };
    });

    // Get timeline/updates
    const timelineUpdates = mockDb.case_updates
      .filter((u: any) => u.case_id === c.id)
      .map((up: any) => {
        const p = mockDb.profiles.find((pr: any) => pr.id === up.user_id);
        return { ...up, profiles: p };
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      ...c,
      police_stations: station,
      officers: officer ? { ...officer, profiles: officerProfile } : null,
      firs: fir ? [fir] : [],
      investigations: caseInvestigations,
      evidence: caseEvidence,
      case_victims: caseVictims.map((v: any) => ({ victims: v })),
      case_criminals: caseCriminals,
      case_updates: timelineUpdates
    };
  }

  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase
    .from('cases')
    .select(`
      *,
      police_stations(*),
      officers(*, profiles(*)),
      firs(*),
      investigations(*, officers(*, profiles(*))),
      evidence(*, officers(*, profiles(*))),
      case_victims(victims(*)),
      case_updates(*, profiles(*))
    `)
    .eq('id', id)
    .single();

  if (!data) return null;

  // Manually fetch and map criminals due to complex join
  const { data: criminalsJoin } = await supabase
    .from('case_criminals')
    .select('*, criminals(*)')
    .eq('case_id', id);

  const formattedCriminals = (criminalsJoin || []).map((cj: any) => ({
    ...cj.criminals,
    relationship_status: cj.relationship_status
  }));

  return {
    ...data,
    case_criminals: formattedCriminals
  };
}

export async function createCase(caseData: Partial<Case>) {
  if (!isSupabaseConfigured()) {
    const newCase = {
      id: `case-${Date.now()}`,
      case_number: caseData.case_number || `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      crime_type: caseData.crime_type || 'Theft',
      description: caseData.description || '',
      incident_date: caseData.incident_date || new Date().toISOString().split('T')[0],
      incident_time: caseData.incident_time || '12:00:00',
      location: caseData.location || '',
      station_id: caseData.station_id || 'station-001',
      assigned_officer_id: caseData.assigned_officer_id || 'officer-001',
      priority: caseData.priority || 'medium',
      status: caseData.status || 'registered',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.cases.push(newCase);
    return newCase;
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('cases').insert(caseData).select().single();
  if (error) throw error;
  return data;
}

export async function updateCase(id: string, caseData: Partial<Case>) {
  if (!isSupabaseConfigured()) {
    const idx = mockDb.cases.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      mockDb.cases[idx] = {
        ...mockDb.cases[idx],
        ...caseData,
        updated_at: new Date().toISOString()
      };
      return mockDb.cases[idx];
    }
    return null;
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('cases').update(caseData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// -------------------------------------------------------------------------
// FIRS (First Information Reports)
// -------------------------------------------------------------------------

export async function getFIRs() {
  if (!isSupabaseConfigured()) {
    return mockDb.firs.map((f: any) => {
      const c = mockDb.cases.find((x: any) => x.id === f.case_id);
      const complainant = mockDb.victims.find((v: any) => v.id === f.complainant_id);
      const station = c ? mockDb.stations.find((s: any) => s.id === c.station_id) : null;
      return {
        ...f,
        cases: c ? { ...c, police_stations: station } : null,
        victims: complainant
      };
    }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase
    .from('firs')
    .select('*, cases(*, police_stations(*)), victims(*)');
  return (data || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createFIR(firData: {
  fir_number: string;
  complaint_description: string;
  complainant_name: string;
  complainant_contact: string;
  complainant_address: string;
  crime_type: string;
  incident_date: string;
  incident_time: string;
  location: string;
  station_id: string;
  assigned_officer_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}) {
  const user = await getCurrentUser();

  if (!isSupabaseConfigured()) {
    // 1. Create a victim record for complainant
    const victim = {
      id: `victim-0${Date.now()}`,
      full_name: firData.complainant_name,
      contact: firData.complainant_contact,
      address: firData.complainant_address,
      notes: 'Logged via FIR registration.',
      created_at: new Date().toISOString()
    };
    mockDb.victims.push(victim);

    // 2. Create the case record
    const c = await createCase({
      crime_type: firData.crime_type,
      description: firData.complaint_description,
      incident_date: firData.incident_date,
      incident_time: firData.incident_time,
      location: firData.location,
      station_id: firData.station_id,
      assigned_officer_id: firData.assigned_officer_id,
      priority: firData.priority,
      status: 'registered'
    });

    // 3. Create case victim mapping
    mockDb.case_victims.push({
      case_id: c.id,
      victim_id: victim.id
    });

    // 4. Create FIR record
    const fir = {
      id: `fir-${Date.now()}`,
      fir_number: firData.fir_number,
      case_id: c.id,
      complaint_date: new Date().toISOString().split('T')[0],
      complaint_description: firData.complaint_description,
      complainant_id: victim.id,
      created_at: new Date().toISOString()
    };
    mockDb.firs.push(fir);

    // 5. Create initial audit trail case update
    mockDb.case_updates.push({
      id: `update-${Date.now()}`,
      case_id: c.id,
      user_id: user?.id || 'user-officer-1',
      title: 'FIR Registered',
      description: `FIR ${fir.fir_number} was officially registered at station. Case record initialized.`,
      update_type: 'FIR Filed',
      created_at: new Date().toISOString()
    });

    // 6. Create initial investigation update
    mockDb.investigations.push({
      id: `investigation-${Date.now()}`,
      case_id: c.id,
      officer_id: firData.assigned_officer_id,
      update_type: 'Initial Investigation',
      notes: `Registered initial details of the incident as logged in the FIR. Initial assessment is ongoing.`,
      next_action: 'Site survey and witness identification.',
      created_at: new Date().toISOString()
    });

    return { fir, case: c };
  }

  // Real Supabase insert logic
  const supabase = await createServerSupabase();

  // Create victim
  const { data: victim, error: vErr } = await supabase
    .from('victims')
    .insert({
      full_name: firData.complainant_name,
      contact: firData.complainant_contact,
      address: firData.complainant_address,
      notes: 'Logged via FIR registration.'
    })
    .select()
    .single();
  if (vErr) throw vErr;

  // Create case
  const { data: caseObj, error: cErr } = await supabase
    .from('cases')
    .insert({
      case_number: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      crime_type: firData.crime_type,
      description: firData.complaint_description,
      incident_date: firData.incident_date,
      incident_time: firData.incident_time,
      location: firData.location,
      station_id: firData.station_id,
      assigned_officer_id: firData.assigned_officer_id,
      priority: firData.priority,
      status: 'registered'
    })
    .select()
    .single();
  if (cErr) throw cErr;

  // Create case_victims mapping
  const { error: cvErr } = await supabase
    .from('case_victims')
    .insert({
      case_id: caseObj.id,
      victim_id: victim.id
    });
  if (cvErr) throw cvErr;

  // Create FIR
  const { data: fir, error: fErr } = await supabase
    .from('firs')
    .insert({
      fir_number: firData.fir_number,
      case_id: caseObj.id,
      complaint_description: firData.complaint_description,
      complainant_id: victim.id
    })
    .select()
    .single();
  if (fErr) throw fErr;

  // Add Case updates audit
  await supabase.from('case_updates').insert({
    case_id: caseObj.id,
    user_id: user?.id,
    title: 'FIR Registered',
    description: `FIR ${fir.fir_number} was officially registered. Case record initialized.`,
    update_type: 'FIR Filed'
  });

  // Add initial investigation log
  await supabase.from('investigations').insert({
    case_id: caseObj.id,
    officer_id: firData.assigned_officer_id,
    update_type: 'Initial Investigation',
    notes: 'Registered initial details of the incident. Assessment ongoing.',
    next_action: 'Witness survey.'
  });

  return { fir, case: caseObj };
}

// -------------------------------------------------------------------------
// CRIMINAL RECORDS
// -------------------------------------------------------------------------

export async function getCriminals(search?: string) {
  if (!isSupabaseConfigured()) {
    let result = mockDb.criminals;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((c: any) => 
        c.full_name.toLowerCase().includes(s) ||
        (c.alias || '').toLowerCase().includes(s) ||
        (c.notes || '').toLowerCase().includes(s)
      );
    }
    return result;
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  let query = supabase.from('criminals').select('*').order('full_name');
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,alias.ilike.%${search}%`);
  }
  const { data } = await query;
  return data || [];
}

export async function getCriminalById(id: string) {
  if (!isSupabaseConfigured()) {
    const crim = mockDb.criminals.find((c: any) => c.id === id);
    if (!crim) return null;

    // Get linked cases
    const caseIds = mockDb.case_criminals
      .filter((cc: any) => cc.criminal_id === id)
      .map((cc: any) => cc.case_id);
    const associatedCases = mockDb.cases.filter((c: any) => caseIds.includes(c.id)).map((c: any) => {
      const joinObj = mockDb.case_criminals.find((cc: any) => cc.case_id === c.id && cc.criminal_id === id);
      return {
        ...c,
        relationship_status: joinObj?.relationship_status
      };
    });

    return {
      ...crim,
      cases: associatedCases
    };
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data: criminal } = await supabase.from('criminals').select('*').eq('id', id).single();
  if (!criminal) return null;

  // Get associated cases
  const { data: joins } = await supabase
    .from('case_criminals')
    .select('*, cases(*)')
    .eq('criminal_id', id);

  const casesWithStatus = (joins || []).map((j: any) => ({
    ...j.cases,
    relationship_status: j.relationship_status
  }));

  return {
    ...criminal,
    cases: casesWithStatus
  };
}

export async function createCriminal(crimData: Partial<Criminal>) {
  if (!isSupabaseConfigured()) {
    const newCrim = {
      id: `criminal-${Date.now()}`,
      full_name: crimData.full_name || '',
      alias: crimData.alias || '',
      date_of_birth: crimData.date_of_birth || '1980-01-01',
      gender: crimData.gender || 'male',
      address: crimData.address || '',
      identification_details: crimData.identification_details || '',
      photograph_url: crimData.photograph_url || '',
      notes: crimData.notes || '',
      status: crimData.status || 'suspect',
      created_at: new Date().toISOString()
    };
    mockDb.criminals.push(newCrim);
    return newCrim;
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('criminals').insert(crimData).select().single();
  if (error) throw error;
  return data;
}

export async function updateCriminal(id: string, crimData: Partial<Criminal>) {
  if (!isSupabaseConfigured()) {
    const idx = mockDb.criminals.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      mockDb.criminals[idx] = {
        ...mockDb.criminals[idx],
        ...crimData
      };
      return mockDb.criminals[idx];
    }
    return null;
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('criminals').update(crimData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// -------------------------------------------------------------------------
// VICTIMS
// -------------------------------------------------------------------------

export async function getVictims(search?: string) {
  if (!isSupabaseConfigured()) {
    let result = mockDb.victims;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((v: any) => v.full_name.toLowerCase().includes(s) || (v.address || '').toLowerCase().includes(s));
    }
    return result;
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  let query = supabase.from('victims').select('*').order('full_name');
  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }
  const { data } = await query;
  return data || [];
}

// -------------------------------------------------------------------------
// EVIDENCE
// -------------------------------------------------------------------------

export async function addEvidence(evidenceData: {
  case_id: string;
  evidence_type: 'Document' | 'Photograph' | 'Video' | 'Physical Evidence' | 'Digital Evidence' | 'Other';
  description: string;
  collected_date: string;
  collected_by: string;
  storage_location: string;
  file_url: string;
  status: 'collected' | 'analyzing' | 'verified' | 'disposed';
}) {
  const user = await getCurrentUser();

  if (!isSupabaseConfigured()) {
    const newEvidence = {
      id: `evidence-${Date.now()}`,
      ...evidenceData,
      created_at: new Date().toISOString()
    };
    mockDb.evidence.push(newEvidence);

    // Add case timeline update
    mockDb.case_updates.push({
      id: `update-${Date.now()}`,
      case_id: evidenceData.case_id,
      user_id: user?.id || 'user-officer-1',
      title: 'Evidence Added',
      description: `New evidence item (${evidenceData.evidence_type}) collected: ${evidenceData.description}`,
      update_type: 'Evidence Linked',
      created_at: new Date().toISOString()
    });

    return newEvidence;
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('evidence').insert(evidenceData).select().single();
  if (error) throw error;

  await supabase.from('case_updates').insert({
    case_id: evidenceData.case_id,
    user_id: user?.id,
    title: 'Evidence Added',
    description: `New evidence item (${evidenceData.evidence_type}) was linked.`,
    update_type: 'Evidence Linked'
  });

  return data;
}

// -------------------------------------------------------------------------
// INVESTIGATIONS & CASE UPDATES
// -------------------------------------------------------------------------

export async function addInvestigationLog(logData: {
  case_id: string;
  officer_id: string;
  update_type: string;
  notes: string;
  next_action: string;
  case_status?: string;
}) {
  const user = await getCurrentUser();

  if (!isSupabaseConfigured()) {
    const newLog = {
      id: `investigation-${Date.now()}`,
      case_id: logData.case_id,
      officer_id: logData.officer_id,
      update_type: logData.update_type,
      notes: logData.notes,
      next_action: logData.next_action,
      created_at: new Date().toISOString()
    };
    mockDb.investigations.push(newLog);

    // Update case status if provided
    if (logData.case_status) {
      const idx = mockDb.cases.findIndex((c: any) => c.id === logData.case_id);
      if (idx !== -1) {
        mockDb.cases[idx].status = logData.case_status;
        mockDb.cases[idx].updated_at = new Date().toISOString();
      }
    }

    // Add case timeline update
    mockDb.case_updates.push({
      id: `update-${Date.now()}`,
      case_id: logData.case_id,
      user_id: user?.id || 'user-officer-1',
      title: logData.update_type,
      description: logData.notes,
      update_type: 'Investigation Logged',
      created_at: new Date().toISOString()
    });

    return newLog;
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('investigations').insert({
    case_id: logData.case_id,
    officer_id: logData.officer_id,
    update_type: logData.update_type,
    notes: logData.notes,
    next_action: logData.next_action
  }).select().single();
  if (error) throw error;

  if (logData.case_status) {
    await supabase.from('cases').update({ status: logData.case_status }).eq('id', logData.case_id);
  }

  await supabase.from('case_updates').insert({
    case_id: logData.case_id,
    user_id: user?.id,
    title: logData.update_type,
    description: logData.notes,
    update_type: 'Investigation Logged'
  });

  return data;
}

// -------------------------------------------------------------------------
// DASHBOARD STATS & KPI LOGIC
// -------------------------------------------------------------------------

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) {
    const cases = mockDb.cases;
    const active = cases.filter((c: any) => ['registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed'].includes(c.status)).length;
    const solved = cases.filter((c: any) => c.status === 'solved').length;
    const closed = cases.filter((c: any) => c.status === 'closed').length;
    const criminals = mockDb.criminals.length;
    const officers = mockDb.officers.filter((o: any) => o.status === 'active').length;

    // Charts calculation:
    // 1. Cases by Crime Type
    const crimeTypesMap = new Map();
    cases.forEach((c: any) => {
      crimeTypesMap.set(c.crime_type, (crimeTypesMap.get(c.crime_type) || 0) + 1);
    });
    const casesByCrimeType = Array.from(crimeTypesMap.entries()).map(([name, value]) => ({ name, value }));

    // 2. Cases by Status
    const statusMap = new Map();
    cases.forEach((c: any) => {
      const cleanName = c.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      statusMap.set(cleanName, (statusMap.get(cleanName) || 0) + 1);
    });
    const casesByStatus = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    // 3. Cases by Station
    const stationMap = new Map();
    cases.forEach((c: any) => {
      const station = mockDb.stations.find((s: any) => s.id === c.station_id);
      const name = station ? station.station_code : 'Unknown';
      stationMap.set(name, (stationMap.get(name) || 0) + 1);
    });
    const casesByStation = Array.from(stationMap.entries()).map(([name, value]) => ({ name, value }));

    // Recent activity list
    const recentActivity = mockDb.case_updates.map((u: any) => {
      const p = mockDb.profiles.find((x: any) => x.id === u.user_id);
      const c = mockDb.cases.find((x: any) => x.id === u.case_id);
      return {
        id: u.id,
        title: u.title,
        description: u.description,
        created_at: u.created_at,
        full_name: p ? p.full_name : 'Officer',
        case_number: c ? c.case_number : 'N/A',
        case_id: c ? c.id : ''
      };
    }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    return {
      totalCases: cases.length,
      activeCases: active,
      solvedCases: solved,
      closedCases: closed,
      totalCriminals: criminals,
      activeOfficers: officers,
      charts: {
        casesByCrimeType,
        casesByStatus,
        casesByStation
      },
      recentActivity
    };
  }

  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();

  // Load counts
  const { count: totalCases } = await supabase.from('cases').select('*', { count: 'exact', head: true });
  const { count: activeCases } = await supabase.from('cases').select('*', { count: 'exact', head: true }).in('status', ['registered', 'under_investigation', 'suspect_identified', 'chargesheet_filed']);
  const { count: solvedCases } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'solved');
  const { count: closedCases } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'closed');
  const { count: totalCriminals } = await supabase.from('criminals').select('*', { count: 'exact', head: true });
  const { count: activeOfficers } = await supabase.from('officers').select('*', { count: 'exact', head: true }).eq('status', 'active');

  // Chart data
  const { data: casesData } = await supabase.from('cases').select('crime_type, status, police_stations(station_code)');
  const cases = casesData || [];

  const crimeTypesMap = new Map();
  const statusMap = new Map();
  const stationMap = new Map();

  cases.forEach((c: any) => {
    crimeTypesMap.set(c.crime_type, (crimeTypesMap.get(c.crime_type) || 0) + 1);
    const cleanStatus = c.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    statusMap.set(cleanStatus, (statusMap.get(cleanStatus) || 0) + 1);
    const stCode = c.police_stations?.station_code || 'Unknown';
    stationMap.set(stCode, (stationMap.get(stCode) || 0) + 1);
  });

  const { data: activityData } = await supabase
    .from('case_updates')
    .select('*, profiles(full_name), cases(case_number)')
    .order('created_at', { ascending: false })
    .limit(10);

  const recentActivity = (activityData || []).map((u: any) => ({
    id: u.id,
    title: u.title,
    description: u.description,
    created_at: u.created_at,
    full_name: u.profiles?.full_name || 'Officer',
    case_number: u.cases?.case_number || 'N/A',
    case_id: u.case_id
  }));

  return {
    totalCases: totalCases || 0,
    activeCases: activeCases || 0,
    solvedCases: solvedCases || 0,
    closedCases: closedCases || 0,
    totalCriminals: totalCriminals || 0,
    activeOfficers: activeOfficers || 0,
    charts: {
      casesByCrimeType: Array.from(crimeTypesMap.entries()).map(([name, value]) => ({ name, value })),
      casesByStatus: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
      casesByStation: Array.from(stationMap.entries()).map(([name, value]) => ({ name, value }))
    },
    recentActivity
  };
}

export async function getAllInvestigations() {
  if (!isSupabaseConfigured()) {
    return mockDb.investigations.map((inv: any) => {
      const c = mockDb.cases.find((x: any) => x.id === inv.case_id);
      const o = mockDb.officers.find((x: any) => x.id === inv.officer_id);
      const p = o ? mockDb.profiles.find((pr: any) => pr.id === o.profile_id) : null;
      return {
        ...inv,
        cases: c,
        officers: o ? { ...o, profiles: p } : null
      };
    }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase
    .from('investigations')
    .select('*, cases(*), officers(*, profiles(*))')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getAllEvidence() {
  if (!isSupabaseConfigured()) {
    return mockDb.evidence.map((ev: any) => {
      const c = mockDb.cases.find((x: any) => x.id === ev.case_id);
      const o = mockDb.officers.find((x: any) => x.id === ev.collected_by);
      const p = o ? mockDb.profiles.find((pr: any) => pr.id === o.profile_id) : null;
      return {
        ...ev,
        cases: c,
        officers: o ? { ...o, profiles: p } : null
      };
    }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data } = await supabase
    .from('evidence')
    .select('*, cases(*), officers(*, profiles(*))')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createPoliceStation(data: { name: string; station_code: string; district: string; address: string; contact: string }) {
  if (!isSupabaseConfigured()) {
    const newStation = {
      id: `station-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString()
    };
    mockDb.stations.push(newStation);
    return newStation;
  }

  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data: res, error } = await supabase
    .from('police_stations')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return res;
}

export async function createOfficer(data: {
  full_name: string;
  email: string;
  badge_number: string;
  rank: string;
  station_id: string;
  phone: string;
}) {
  if (!isSupabaseConfigured()) {
    const profileId = `user-officer-${Date.now()}`;
    const newProfile = {
      id: profileId,
      full_name: data.full_name,
      email: data.email,
      role: 'officer',
      avatar_url: `/avatars/default.jpg`,
      created_at: new Date().toISOString()
    };

    const officerId = `officer-${Date.now()}`;
    const newOfficer = {
      id: officerId,
      profile_id: profileId,
      badge_number: data.badge_number,
      rank: data.rank,
      station_id: data.station_id,
      phone: data.phone,
      joining_date: new Date().toISOString().split('T')[0],
      status: 'active',
      created_at: new Date().toISOString()
    };

    mockDb.profiles.push(newProfile);
    mockDb.officers.push(newOfficer);
    return { profile: newProfile, officer: newOfficer };
  }

  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  
  const { data: newProfile, error: profileError } = await supabase
    .from('profiles')
    .insert([{
      full_name: data.full_name,
      email: data.email,
      role: 'officer',
    }])
    .select()
    .single();

  if (profileError) throw profileError;

  const { data: newOfficer, error: officerError } = await supabase
    .from('officers')
    .insert([{
      profile_id: newProfile.id,
      badge_number: data.badge_number,
      rank: data.rank,
      station_id: data.station_id,
      phone: data.phone,
      status: 'active'
    }])
    .select()
    .single();

  if (officerError) throw officerError;

  return { profile: newProfile, officer: newOfficer };
}

export async function updateCaseDetails(id: string, data: { priority: 'low' | 'medium' | 'high' | 'critical'; status: string; description: string; location: string; assigned_officer_id: string }) {
  if (!isSupabaseConfigured()) {
    const idx = mockDb.cases.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      const prevStatus = mockDb.cases[idx].status;
      mockDb.cases[idx] = {
        ...mockDb.cases[idx],
        priority: data.priority,
        status: data.status,
        description: data.description,
        location: data.location,
        assigned_officer_id: data.assigned_officer_id,
        updated_at: new Date().toISOString()
      };

      if (prevStatus !== data.status) {
        mockDb.case_updates.push({
          id: `update-${Date.now()}`,
          case_id: id,
          user_id: 'user-divyom',
          title: 'Case Details Updated',
          description: `Case status changed from ${prevStatus.replace(/_/g, ' ')} to ${data.status.replace(/_/g, ' ')}. Location and assignment updated.`,
          created_at: new Date().toISOString()
        });
      }
      return mockDb.cases[idx];
    }
    throw new Error('Case not found');
  }

  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data: res, error } = await supabase
    .from('cases')
    .update({
      priority: data.priority,
      status: data.status,
      description: data.description,
      location: data.location,
      assigned_officer_id: data.assigned_officer_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return res;
}

export async function createVictim(data: { full_name: string; contact: string; address: string; notes: string }) {
  if (!isSupabaseConfigured()) {
    const newVictim = {
      id: `victim-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString()
    };
    mockDb.victims.push(newVictim);
    return newVictim;
  }

  const supabase = typeof window === 'undefined' ? await createServerSupabase() : createBrowserSupabase();
  const { data: res, error } = await supabase
    .from('victims')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return res;
}


