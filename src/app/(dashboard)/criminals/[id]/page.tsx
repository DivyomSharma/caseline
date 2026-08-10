import { getCriminalById } from '@/lib/supabase/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, User, Shield, Briefcase, Calendar, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CriminalProfilePage({ params }: PageProps) {
  const { id } = await params;
  const criminal = await getCriminalById(id);

  if (!criminal) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'wanted': return 'bg-red-50 text-red-700 border-red-200';
      case 'convicted': return 'bg-slate-900 text-white border-slate-950';
      case 'accused': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <Link
          href="/criminals"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Criminal Index</span>
        </Link>
      </div>

      {/* Grid Profile sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Booking Photo & Personal info */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center space-y-4">
            <div className="w-32 h-32 rounded-xl bg-slate-100 mx-auto flex items-center justify-center border border-slate-200 overflow-hidden relative">
              <User className="w-16 h-16 text-slate-350" />
            </div>
            
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">{criminal.full_name}</h2>
              {criminal.alias && (
                <p className="text-xs font-semibold text-slate-400 italic">Alias: {criminal.alias}</p>
              )}
            </div>

            <span className={`inline-block text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${getStatusColor(criminal.status)}`}>
              Status: {criminal.status}
            </span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              Personal Information
            </h3>
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Gender</span>
                <span className="text-slate-800 capitalize">{criminal.gender}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Date of Birth</span>
                <span className="text-slate-800">{new Date(criminal.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Fictional Residence Address</span>
                <span className="text-slate-800 leading-5">{criminal.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Case list history & Identifiers */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
              Identification Marks & Priors
            </h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Physical Identifiers</span>
                <p className="text-slate-700 font-medium leading-5">{criminal.identification_details || 'No specific physical identification marks logged.'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Case History Notes</span>
                <p className="text-slate-700 font-medium leading-5">{criminal.notes || 'No general notes compiled.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
              Linked Case History Files
            </h3>
            
            <div className="space-y-3">
              {criminal.cases?.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  No cases linked to this criminal in the registry database.
                </div>
              ) : (
                criminal.cases.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/cases/${c.id}`} className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-xs font-mono">
                          {c.case_number}
                        </Link>
                        <span className="text-slate-450 text-[10px]">•</span>
                        <span className="text-xs font-bold text-slate-700">{c.crime_type}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Incident: {new Date(c.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border rounded-full ${
                        c.relationship_status === 'convicted' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        Charged: {c.relationship_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
