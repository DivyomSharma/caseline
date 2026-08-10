import { getPoliceStations, getOfficers } from '@/lib/supabase/db';
import { Building2, Phone, MapPin, ShieldAlert, Users } from 'lucide-react';

export default async function PoliceStationsPage() {
  const stations = await getPoliceStations();
  const officers = await getOfficers();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Police Station Precincts</h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Directory of administrative headquarters, district precincts, and command centers.
        </p>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stations.length === 0 ? (
          <div className="col-span-full text-center py-8 text-xs text-slate-400 font-medium">
            No station precincts registered.
          </div>
        ) : (
          stations.map((st: any) => {
            // Count officers belonging to this station
            const stationOfficers = officers.filter((o: any) => o.station_id === st.id);
            return (
              <div key={st.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      {st.station_code}
                    </span>
                    <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 leading-4">{st.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{st.district}</p>
                </div>

                <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-start space-x-2 text-slate-650">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-4">{st.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-650">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold font-mono">{st.contact}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4.5 h-4.5 text-slate-400" />
                    <span>Officers count</span>
                  </div>
                  <span className="text-slate-800 text-xs font-extrabold">{stationOfficers.length} staff</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
