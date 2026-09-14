// Caseline Seed Data
// Pre-loaded seed records for database initialization and local engine configuration

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'officer' | 'viewer';
  avatar_url: string;
  created_at: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  station_code: string;
  district: string;
  address: string;
  contact: string;
  created_at: string;
}

export interface Officer {
  id: string;
  profile_id: string;
  badge_number: string;
  rank: string;
  station_id: string;
  phone: string;
  joining_date: string;
  status: 'active' | 'inactive' | 'suspended' | 'on_leave';
  created_at: string;
}

export interface Victim {
  id: string;
  full_name: string;
  contact: string;
  address: string;
  notes: string;
  created_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  crime_type: string;
  description: string;
  incident_date: string;
  incident_time: string;
  location: string;
  station_id: string;
  assigned_officer_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'registered' | 'under_investigation' | 'suspect_identified' | 'chargesheet_filed' | 'solved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface FIR {
  id: string;
  fir_number: string;
  case_id: string;
  complaint_date: string;
  complaint_description: string;
  complainant_id: string;
  created_at: string;
}

export interface Criminal {
  id: string;
  full_name: string;
  alias: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  identification_details: string;
  photograph_url: string;
  notes: string;
  status: 'suspect' | 'accused' | 'convicted' | 'acquitted' | 'wanted';
  created_at: string;
}

export interface CaseCriminal {
  case_id: string;
  criminal_id: string;
  relationship_status: 'suspect' | 'accused' | 'convicted' | 'acquitted';
}

export interface CaseVictim {
  case_id: string;
  victim_id: string;
}

export interface Investigation {
  id: string;
  case_id: string;
  officer_id: string;
  update_type: string;
  notes: string;
  next_action: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  evidence_type: 'Document' | 'Photograph' | 'Video' | 'Physical Evidence' | 'Digital Evidence' | 'Other';
  description: string;
  collected_date: string;
  collected_by: string;
  storage_location: string;
  file_url: string;
  status: 'collected' | 'analyzing' | 'verified' | 'disposed';
  created_at: string;
}

export interface CaseUpdate {
  id: string;
  case_id: string;
  user_id: string;
  title: string;
  description: string;
  update_type: string;
  created_at: string;
}

// -------------------------------------------------------------------------
// SEED ENTITIES DEFINITION
// -------------------------------------------------------------------------

export const STATIONS: PoliceStation[] = [
  {
    id: "station-001",
    name: "Central District Police Station",
    station_code: "PS-CNTRL",
    district: "Central District",
    address: "12 Parliament Street, New Delhi",
    contact: "+91-11-23345678",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: "station-002",
    name: "North District Police Station",
    station_code: "PS-NORTH",
    district: "North District",
    address: "Civil Lines, Near Mall Road, Delhi",
    contact: "+91-11-23912345",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: "station-003",
    name: "South District Police Station",
    station_code: "PS-SOUTH",
    district: "South District",
    address: "Saket Sector 4, New Delhi",
    contact: "+91-11-29567890",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: "station-004",
    name: "East District Police Station",
    station_code: "PS-EAST",
    district: "East District",
    address: "Preet Vihar, Vikas Marg, Delhi",
    contact: "+91-11-22543210",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: "station-005",
    name: "Cyber Crime Division Headquarters",
    station_code: "PS-CYBER",
    district: "Special Cell",
    address: "Sector 5, Dwarka, New Delhi",
    contact: "+91-11-28087654",
    created_at: "2024-01-10T10:00:00Z"
  }
];

export const PROFILES: Profile[] = [
  {
    id: "user-divyom",
    full_name: "Commissioner Divyom",
    email: "divyom@caseline.gov",
    role: "admin",
    avatar_url: "/avatars/officer-divyom.jpg",
    created_at: "2024-01-11T08:00:00Z"
  },
  {
    id: "user-samar",
    full_name: "Additional Commissioner Samar",
    email: "samar@caseline.gov",
    role: "admin",
    avatar_url: "/avatars/officer-samar.jpg",
    created_at: "2024-01-11T08:30:00Z"
  },
  {
    id: "user-admin",
    full_name: "ACP Sunita Deshmukh",
    email: "admin@caseline.gov",
    role: "admin",
    avatar_url: "/avatars/officer-admin.jpg",
    created_at: "2024-01-11T09:00:00Z"
  },
  // Officers
  {
    id: "user-officer-1",
    full_name: "Inspector Arjun Mehta",
    email: "arjun.mehta@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-1.jpg",
    created_at: "2024-01-12T09:00:00Z"
  },
  {
    id: "user-officer-2",
    full_name: "Inspector Vikram Rathore",
    email: "vikram.rathore@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-2.jpg",
    created_at: "2024-01-12T09:15:00Z"
  },
  {
    id: "user-officer-3",
    full_name: "Sub-Inspector Rajesh Kumar",
    email: "rajesh.kumar@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-3.jpg",
    created_at: "2024-01-12T09:30:00Z"
  },
  {
    id: "user-officer-4",
    full_name: "Sub-Inspector Priya Sharma",
    email: "priya.sharma@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-4.jpg",
    created_at: "2024-01-12T09:45:00Z"
  },
  {
    id: "user-officer-5",
    full_name: "Inspector Kabir Khan",
    email: "kabir.khan@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-5.jpg",
    created_at: "2024-01-12T10:00:00Z"
  },
  {
    id: "user-officer-6",
    full_name: "Sub-Inspector Amit Verma",
    email: "amit.verma@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-6.jpg",
    created_at: "2024-01-12T10:15:00Z"
  },
  {
    id: "user-officer-7",
    full_name: "Sub-Inspector Sneha Patil",
    email: "sneha.patil@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-7.jpg",
    created_at: "2024-01-12T10:30:00Z"
  },
  {
    id: "user-officer-8",
    full_name: "Inspector Devendra Singh",
    email: "devendra.singh@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-8.jpg",
    created_at: "2024-01-12T10:45:00Z"
  },
  {
    id: "user-officer-9",
    full_name: "Sub-Inspector Rahul Joshi",
    email: "rahul.joshi@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-9.jpg",
    created_at: "2024-01-12T11:00:00Z"
  },
  {
    id: "user-officer-10",
    full_name: "Inspector Neha Gupta",
    email: "neha.gupta@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-10.jpg",
    created_at: "2024-01-12T11:15:00Z"
  },
  {
    id: "user-officer-11",
    full_name: "Sub-Inspector Sanjay Dutt",
    email: "sanjay.dutt@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-11.jpg",
    created_at: "2024-01-12T11:30:00Z"
  },
  {
    id: "user-officer-12",
    full_name: "Inspector Meera Bai",
    email: "meera.bai@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-12.jpg",
    created_at: "2024-01-12T11:45:00Z"
  },
  {
    id: "user-officer-13",
    full_name: "Sub-Inspector Kiran Bedi",
    email: "kiran.bedi@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-13.jpg",
    created_at: "2024-01-12T12:00:00Z"
  },
  {
    id: "user-officer-14",
    full_name: "Inspector Alok Nath",
    email: "alok.nath@caseline.gov",
    role: "officer",
    avatar_url: "/avatars/officer-14.jpg",
    created_at: "2024-01-12T12:15:00Z"
  },
  // Viewers
  {
    id: "user-viewer-1",
    full_name: "Director General R. K. Sen",
    email: "viewer@caseline.gov",
    role: "viewer",
    avatar_url: "/avatars/viewer-1.jpg",
    created_at: "2024-01-11T12:00:00Z"
  }
];

export const OFFICERS: Officer[] = [
  {
    id: "officer-divyom",
    profile_id: "user-divyom",
    badge_number: "IPS-0001",
    rank: "Commissioner",
    station_id: "station-001",
    phone: "+91-9999999901",
    joining_date: "2010-01-01",
    status: "active",
    created_at: "2024-01-11T08:00:00Z"
  },
  {
    id: "officer-samar",
    profile_id: "user-samar",
    badge_number: "IPS-0002",
    rank: "Additional Commissioner",
    station_id: "station-001",
    phone: "+91-9999999902",
    joining_date: "2012-05-15",
    status: "active",
    created_at: "2024-01-11T08:30:00Z"
  },
  {
    id: "officer-admin",
    profile_id: "user-admin",
    badge_number: "IPS-8902",
    rank: "ACP",
    station_id: "station-001",
    phone: "+91-9876543210",
    joining_date: "2015-06-01",
    status: "active",
    created_at: "2024-01-11T09:00:00Z"
  },
  {
    id: "officer-001",
    profile_id: "user-officer-1",
    badge_number: "PS-INS-042",
    rank: "Inspector",
    station_id: "station-001",
    phone: "+91-9876543211",
    joining_date: "2018-04-12",
    status: "active",
    created_at: "2024-01-12T09:00:00Z"
  },
  {
    id: "officer-002",
    profile_id: "user-officer-2",
    badge_number: "PS-INS-189",
    rank: "Inspector",
    station_id: "station-002",
    phone: "+91-9876543212",
    joining_date: "2017-08-20",
    status: "active",
    created_at: "2024-01-12T09:15:00Z"
  },
  {
    id: "officer-003",
    profile_id: "user-officer-3",
    badge_number: "PS-SUB-011",
    rank: "Sub-Inspector",
    station_id: "station-001",
    phone: "+91-9876543213",
    joining_date: "2020-02-15",
    status: "active",
    created_at: "2024-01-12T09:30:00Z"
  },
  {
    id: "officer-004",
    profile_id: "user-officer-4",
    badge_number: "PS-SUB-087",
    rank: "Sub-Inspector",
    station_id: "station-003",
    phone: "+91-9876543214",
    joining_date: "2021-11-01",
    status: "active",
    created_at: "2024-01-12T09:45:00Z"
  },
  {
    id: "officer-005",
    profile_id: "user-officer-5",
    badge_number: "PS-INS-007",
    rank: "Inspector",
    station_id: "station-003",
    phone: "+91-9876543215",
    joining_date: "2016-03-10",
    status: "active",
    created_at: "2024-01-12T10:00:00Z"
  },
  {
    id: "officer-006",
    profile_id: "user-officer-6",
    badge_number: "PS-SUB-124",
    rank: "Sub-Inspector",
    station_id: "station-002",
    phone: "+91-9876543216",
    joining_date: "2022-01-10",
    status: "active",
    created_at: "2024-01-12T10:15:00Z"
  },
  {
    id: "officer-007",
    profile_id: "user-officer-7",
    badge_number: "PS-SUB-390",
    rank: "Sub-Inspector",
    station_id: "station-004",
    phone: "+91-9876543217",
    joining_date: "2020-09-18",
    status: "active",
    created_at: "2024-01-12T10:30:00Z"
  },
  {
    id: "officer-008",
    profile_id: "user-officer-8",
    badge_number: "PS-INS-332",
    rank: "Inspector",
    station_id: "station-004",
    phone: "+91-9876543218",
    joining_date: "2015-05-24",
    status: "active",
    created_at: "2024-01-12T10:45:00Z"
  },
  {
    id: "officer-009",
    profile_id: "user-officer-9",
    badge_number: "PS-SUB-209",
    rank: "Sub-Inspector",
    station_id: "station-005",
    phone: "+91-9876543219",
    joining_date: "2019-10-05",
    status: "active",
    created_at: "2024-01-12T11:00:00Z"
  },
  {
    id: "officer-010",
    profile_id: "user-officer-10",
    badge_number: "PS-INS-505",
    rank: "Inspector",
    station_id: "station-005",
    phone: "+91-9876543220",
    joining_date: "2017-02-14",
    status: "active",
    created_at: "2024-01-12T11:15:00Z"
  },
  {
    id: "officer-011",
    profile_id: "user-officer-11",
    badge_number: "PS-SUB-009",
    rank: "Sub-Inspector",
    station_id: "station-001",
    phone: "+91-9876543221",
    joining_date: "2021-04-01",
    status: "on_leave",
    created_at: "2024-01-12T11:30:00Z"
  },
  {
    id: "officer-012",
    profile_id: "user-officer-12",
    badge_number: "PS-INS-022",
    rank: "Inspector",
    station_id: "station-002",
    phone: "+91-9876543222",
    joining_date: "2016-12-25",
    status: "active",
    created_at: "2024-01-12T11:45:00Z"
  },
  {
    id: "officer-013",
    profile_id: "user-officer-13",
    badge_number: "PS-SUB-013",
    rank: "Sub-Inspector",
    station_id: "station-003",
    phone: "+91-9876543223",
    joining_date: "2022-07-07",
    status: "active",
    created_at: "2024-01-12T12:00:00Z"
  },
  {
    id: "officer-014",
    profile_id: "user-officer-14",
    badge_number: "PS-INS-111",
    rank: "Inspector",
    station_id: "station-004",
    phone: "+91-9876543224",
    joining_date: "2014-01-15",
    status: "suspended",
    created_at: "2024-01-12T12:15:00Z"
  }
];

export const VICTIMS: Victim[] = Array.from({ length: 25 }).map((_, index) => {
  const names = [
    "Rahul Sharma", "Anjali Gupta", "Rohan Verma", "Preeti Kapoor", "Suresh Kumar",
    "Divya Singh", "Anoop Nair", "Kriti Sanon", "Manish Malhotra", "Pooja Hegde",
    "Gaurav Chopra", "Sunita Rao", "Karan Johar", "Aditi Rao Hydari", "Rishi Kapoor",
    "Shalini Pandey", "Amitabh Bachchan", "Deepika Padukone", "Ranveer Singh", "Alia Bhatt",
    "Sidharth Malhotra", "Kiara Advani", "Varun Dhawan", "Shraddha Kapoor", "Kartik Aaryan"
  ];
  const locations = [
    "Sector 15, Dwarka", "Connaught Place", "Bandra West, Mumbai", "Indiranagar, Bangalore", "Salt Lake, Kolkata",
    "Saket Sector 3, Delhi", "Karol Bagh, Delhi", "Vasant Kunj, Delhi", "Greater Kailash, Delhi", "Noida Sector 62",
    "Gurgaon Phase 3", "Chandni Chowk", "Lajpat Nagar", "Hauz Khas", "Rohini Sector 9",
    "Mayur Vihar Phase 1", "Janakpuri", "Defence Colony", "Rajouri Garden", "Chanakyapuri",
    "SDA Market", "Okhla Phase 3", "Pitam Pura", "Shahdara", "Patparganj"
  ];
  return {
    id: `victim-0${index + 1}`.replace("victim-02", "victim-2"),
    full_name: names[index],
    contact: `+91-998877${1000 + index}`,
    address: locations[index] + ", India",
    notes: `Complainant/Victim registered under index ${index + 1}`,
    created_at: new Date(2025, 0, 1 + index).toISOString()
  };
});

export const CRIMINALS: Criminal[] = Array.from({ length: 30 }).map((_, index) => {
  const firstNames = [
    "Vijay", "Ramesh", "Sanjay", "Vikram", "Ajay", "Rajesh", "anil", "Sunil", "Karan", "Arjun",
    "Chhota", "Bada", "Bunty", "Babli", "Jaggu", "Raju", "Shera", "Kalia", "Gabbar", "Mogambo",
    "Munna", "Circuit", "Pappu", "Kanti", "Billa", "Lallan", "Mangal", "Sardar", "Goli", "Sunder"
  ];
  const lastNames = [
    "Mallya", "Kumar", "Dutt", "Singh", "Sharma", "Yadav", "Kapoor", "Joshi", "Verma", "Rathore",
    "Rajan", "Shakeel", "Chor", "Singh", "Dada", "Srivastava", "Khan", "Pathan", "Gujjar", "Bhai",
    "Bhaiya", "Bhai", "Yadav", "Shah", "Pandey", "Prasad", "Pandey", "Khan", "Sena", "Soni"
  ];
  const aliases = [
    "The Baron", "Laddoo", "Sanju Baba", "Ranger", "Silent Thief", "Anna", "Computer", "Speedy", "Don", "Falcon",
    "Chhota Rajan", "Bada Shakeel", "Slick Bunty", "Smart Babli", "Jaggu Dada", "Raju Guide", "Sher Khan", "Kalia", "Gabbar", "Mogambo",
    "Munna Bhai", "Circuit", "Pappu Can't Dance", "Kanti Shah", "Billa", "Lallan Daku", "Mangal Pandey", "Sardar Khan", "Goli", "Sunder Bhai"
  ];
  const gender = index === 13 ? "female" : "male";
  const statuses: Criminal['status'][] = ["suspect", "accused", "convicted", "wanted", "acquitted"];

  return {
    id: `criminal-0${index + 1}`.replace("criminal-02", "criminal-2"),
    full_name: `${firstNames[index]} ${lastNames[index]}`,
    alias: aliases[index],
    date_of_birth: new Date(1975 + (index % 25), index % 12, (index * 7) % 28 + 1).toISOString().split('T')[0],
    gender: gender as 'male' | 'female',
    address: `Fictional Hideout ${index + 1}, National Capital Region, India`,
    identification_details: `Scar on left cheek, height approx 5'${8 + (index % 5)}", tattoo on right arm.`,
    photograph_url: `/criminals/criminal-${index + 1}.jpg`,
    notes: `Subject has multiple priors including ${index % 3 === 0 ? "theft" : index % 3 === 1 ? "burglary" : "fraud"}.`,
    status: statuses[index % 5],
    created_at: new Date(2024, 0, 15 + index).toISOString()
  };
});

// Crime types
const CRIME_TYPES = [
  "Theft", "Burglary", "Fraud", "Cyber Crime", "Assault",
  "Missing Person", "Property Dispute", "Vehicle Theft"
];

// Generate 40 Cases
export const CASES: Case[] = Array.from({ length: 40 }).map((_, index) => {
  const station = STATIONS[index % 5];
  const officersForStation = OFFICERS.filter(o => o.station_id === station.id);
  const officer = officersForStation[index % officersForStation.length] || OFFICERS[0];
  const crimeType = CRIME_TYPES[index % CRIME_TYPES.length];
  const priorities: Case['priority'][] = ["low", "medium", "high", "critical"];
  const statuses: Case['status'][] = ["registered", "under_investigation", "suspect_identified", "chargesheet_filed", "solved", "closed"];

  const caseNum = `CR-2026-${(1001 + index)}`;
  const status = index === 0 ? "under_investigation" : statuses[index % statuses.length];

  return {
    id: `case-${100 + index}`,
    case_number: caseNum,
    crime_type: crimeType,
    description: `Fictional case report regarding incident of ${crimeType.toLowerCase()} reported at ${station.name}. Details contain investigative logs, evidence files, and suspect list.`,
    incident_date: new Date(2026, 6, 1 + (index % 30)).toISOString().split('T')[0],
    incident_time: `1${index % 10}:${(index * 13) % 60}:00`,
    location: `Sector ${index + 1}, ${station.district}`,
    station_id: station.id,
    assigned_officer_id: officer.id,
    priority: priorities[index % priorities.length],
    status: status,
    created_at: new Date(2026, 6, 1 + (index % 30), 10, index % 60).toISOString(),
    updated_at: new Date(2026, 7, 1 + (index % 10), 12, index % 60).toISOString()
  };
});

// FIRs linking to Cases
export const FIRS: FIR[] = CASES.map((c, index) => {
  const complainant = VICTIMS[index % VICTIMS.length];
  return {
    id: `fir-${200 + index}`,
    fir_number: `FIR-2026-${1000 + index + 1}`,
    case_id: c.id,
    complaint_date: c.incident_date,
    complaint_description: `Initial complaint logged by ${complainant.full_name}. Incident occurred at ${c.location} involving ${c.crime_type}. Details: ${c.description}`,
    complainant_id: complainant.id,
    created_at: c.created_at
  };
});

// Link case criminals (suspects/accused/convicted)
export const CASE_CRIMINALS: CaseCriminal[] = CASES.map((c, index) => {
  const criminal = CRIMINALS[index % CRIMINALS.length];
  const relation: CaseCriminal['relationship_status'] = c.status === "solved" || c.status === "closed" ? "convicted" : "accused";
  return {
    case_id: c.id,
    criminal_id: criminal.id,
    relationship_status: relation
  };
});

// Link additional criminals for some cases
CASE_CRIMINALS.push(
  { case_id: "case-100", criminal_id: "criminal-02", relationship_status: "suspect" },
  { case_id: "case-100", criminal_id: "criminal-03", relationship_status: "accused" },
  { case_id: "case-102", criminal_id: "criminal-05", relationship_status: "suspect" },
  { case_id: "case-105", criminal_id: "criminal-01", relationship_status: "convicted" }
);

// Link case victims
export const CASE_VICTIMS: CaseVictim[] = CASES.map((c, index) => {
  const victim = VICTIMS[index % VICTIMS.length];
  return {
    case_id: c.id,
    victim_id: victim.id
  };
});

// Generate 60 Investigation Updates
export const INVESTIGATIONS: Investigation[] = Array.from({ length: 60 }).map((_, index) => {
  const caseIdx = index % CASES.length;
  const c = CASES[caseIdx];
  const updateTypes = [
    "Initial Investigation", "Witness Interview", "Evidence Collection", 
    "Suspect Identification", "Interrogation", "Document Verification", 
    "Field Investigation", "Final Review"
  ];
  const updateType = updateTypes[index % updateTypes.length];
  const notes = [
    "Inspected the scene of the incident. Noted surrounding conditions and collected initial CCTV listings.",
    "Interviewed complainant and witnesses present at the scene. Statements recorded and signed.",
    "Recovered electronic logs and physical tokens from location. Logged items into the evidence database.",
    "Identified a suspect matching witness descriptions. Profile cross-checked in records repository.",
    "Conducted interrogation of the primary suspect. Subject denied involvement but offered inconsistent alibis.",
    "Verified identity cards and local registration documents. Verification results logged.",
    "Conducted local sweep of coordinates and surveyed neighbors. No additional sightings reported.",
    "Reviewed case file with commanding officer. Prepared case briefs for final compilation."
  ];

  return {
    id: `investigation-300-${index}`,
    case_id: c.id,
    officer_id: c.assigned_officer_id,
    update_type: updateType,
    notes: notes[index % notes.length] + ` Case notes linked to case: ${c.case_number}.`,
    next_action: index % 4 === 0 ? "Awaiting forensic reports." : "Follow-up interrogation scheduled.",
    created_at: new Date(2026, 6, 2 + (index % 25), 10, index % 60).toISOString()
  };
});

// Generate 50 Evidence records
export const EVIDENCE: Evidence[] = Array.from({ length: 50 }).map((_, index) => {
  const caseIdx = index % CASES.length;
  const c = CASES[caseIdx];
  const evidenceTypes: Evidence['evidence_type'][] = ["Document", "Photograph", "Video", "Physical Evidence", "Digital Evidence", "Other"];
  const type = evidenceTypes[index % evidenceTypes.length];
  const descriptions = [
    "CCTV footage backup from the main gate camera showing the suspect's vehicle.",
    "Fictional forensic fingerprints report extracted from the main locker door handles.",
    "Audio recording of initial complaint statement logged under badge supervision.",
    "Physical item (broken lock latch) retrieved from the rear door of the facility.",
    "Fictional banking ledger sheets showing suspicious transactions from the accused.",
    "A DSLR photograph of the crime scene location detailing entry points."
  ];
  const statuses: Evidence['status'][] = ["collected", "analyzing", "verified", "disposed"];

  return {
    id: `evidence-400-${index}`,
    case_id: c.id,
    evidence_type: type,
    description: descriptions[index % descriptions.length] + ` Fictional evidence record for case ${c.case_number}.`,
    collected_date: c.incident_date,
    collected_by: c.assigned_officer_id,
    storage_location: `Precinct Vault Room A, Locker ${index + 1}`,
    file_url: `/demo-evidence/evidence-${(index % 6) + 1}.jpg`,
    status: statuses[index % statuses.length],
    created_at: new Date(2026, 6, 2 + (index % 25)).toISOString()
  };
});

// Generate 60 Case Updates (general audit updates for timeline)
export const CASE_UPDATES: CaseUpdate[] = Array.from({ length: 60 }).map((_, index) => {
  const caseIdx = index % CASES.length;
  const c = CASES[caseIdx];
  const titles = [
    "FIR Filed", "Officer Assigned", "Case Opened", "Status Updated", 
    "Evidence Linked", "Investigation Logged", "Priority Adjusted", "Case Solved"
  ];
  const title = titles[index % titles.length];

  return {
    id: `case-update-500-${index}`,
    case_id: c.id,
    user_id: "user-officer-1",
    title: title,
    description: `System audited activity: ${title.toLowerCase()} for case number ${c.case_number}.`,
    update_type: title,
    created_at: new Date(2026, 6, 1 + (index % 28), 9, index % 60).toISOString()
  };
});

// -------------------------------------------------------------------------
// Demo data for Court Tracker, Statement Intelligence, and Legal Sections
// -------------------------------------------------------------------------

export const COURT_CASES = [
  {
    id: "court-100",
    case_id: "case-100",
    court_complex: "Tis Hazari Courts",
    cnr_number: "DLCT01-002481-2026",
    judge_name: "Justice A. Malhotra",
    next_hearing_date: "2026-10-14",
    case_status: "trial",
    created_at: "2026-08-02T10:00:00Z"
  },
  {
    id: "court-105",
    case_id: "case-105",
    court_complex: "Karkardooma Courts",
    cnr_number: "DLCT03-001192-2026",
    judge_name: "Justice R. Sethi",
    next_hearing_date: "2026-09-30",
    case_status: "judgment",
    created_at: "2026-08-10T10:00:00Z"
  }
];

export const HEARINGS = [
  {
    id: "hearing-100-1",
    court_case_id: "court-100",
    hearing_date: "2026-08-20",
    purpose: "Framing of charges",
    order_summary: "Charges framed under BNS Section 303. Next hearing scheduled for prosecution evidence.",
    created_at: "2026-08-20T11:00:00Z"
  },
  {
    id: "hearing-100-2",
    court_case_id: "court-100",
    hearing_date: "2026-09-14",
    purpose: "Prosecution evidence",
    order_summary: "Two prosecution witnesses examined. Cross-examination adjourned.",
    created_at: "2026-09-14T11:00:00Z"
  },
  {
    id: "hearing-105-1",
    court_case_id: "court-105",
    hearing_date: "2026-08-25",
    purpose: "Final arguments",
    order_summary: "Arguments concluded on both sides. Matter reserved for judgment.",
    created_at: "2026-08-25T11:00:00Z"
  }
];

// Two witness statements with a deliberate ~1 hour timeline conflict and a
// vehicle plate mismatch, so the Statement Intelligence tab has something to
// flag out of the box.
export const STATEMENTS = [
  {
    id: "statement-100-1",
    case_id: "case-100",
    witness_name: "Rakesh Kumar (Shopkeeper)",
    statement_text: "I saw the two men enter the shop at around 8:15 PM. One of them was carrying a bag. A white car, plate DL 8C 4521, was parked outside with the engine running.",
    recorded_date: "2026-07-03",
    created_at: "2026-07-03T20:45:00Z"
  },
  {
    id: "statement-100-2",
    case_id: "case-100",
    witness_name: "Sunita Devi (Neighbour)",
    statement_text: "I noticed some commotion near the shop close to 9:30 PM. There was a white vehicle, I think the number was DL 8C 4529, parked a little further down the road.",
    recorded_date: "2026-07-04",
    created_at: "2026-07-04T09:15:00Z"
  },
  {
    id: "statement-105-1",
    case_id: "case-105",
    witness_name: "Vikram Singh (Complainant)",
    statement_text: "The missing person was last seen leaving the residence at 7 PM on foot, heading towards the market.",
    recorded_date: "2026-07-08",
    created_at: "2026-07-08T18:00:00Z"
  }
];

export const CASE_SECTIONS_SEED = [
  { case_id: "case-100", section_id: "bns-303" },
  { case_id: "case-101", section_id: "bns-331" },
  { case_id: "case-102", section_id: "bns-318" },
  { case_id: "case-105", section_id: "bns-303" }
];
