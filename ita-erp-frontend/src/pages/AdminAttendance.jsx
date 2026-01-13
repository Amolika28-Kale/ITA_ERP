import { useEffect, useState } from "react";
import { fetchDailyAttendance } from "../services/adminAttendanceService";
import dayjs from "dayjs";
import { Calendar, Users, Clock, AlertCircle, Search, UserCheck, UserMinus } from "lucide-react";

export default function AdminAttendance() {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetchDailyAttendance(date);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const filteredData = data?.data?.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = [
    { label: "Total", value: data?.data?.length || 0, icon: Users, color: "blue" },
    { label: "Present", value: data?.data?.filter(r => r.status === 'present').length || 0, icon: UserCheck, color: "green" },
    { label: "Absent", value: data?.data?.filter(r => r.status === 'absent').length || 0, icon: UserMinus, color: "rose" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-3 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* HEADER SECTION - Glassmorphism style */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between sticky top-0 z-20 bg-[#f8fafc]/80 dark:bg-slate-950/80 backdrop-blur-md py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              Attendance <span className="text-blue-600"></span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time workforce monitoring</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
            </div>
            {/* Date Picker */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* QUICK STATS - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
              <div className="relative z-10 flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-950/30 text-${stat.color}-600`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
                </div>
              </div>
              {/* Background Accent */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500`} />
            </div>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Employee Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Log Timeline</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Work Hours</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {!loading && filteredData.map(row => (
                  <tr key={row.userId} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{row.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{row.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg font-bold">
                          {row.loginTime ? dayjs(row.loginTime).format("hh:mm A") : "--:--"}
                        </span>
                        <div className="h-px w-4 bg-slate-200" />
                        <span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg font-bold">
                          {row.logoutTime ? dayjs(row.logoutTime).format("hh:mm A") : "--:--"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {formatMinutes(row.workedMinutes)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {!loading && filteredData.map(row => (
              <div key={row.userId} className="p-5 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
                      {row.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{row.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{row.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-black mb-1">In</p>
                    <p className="text-sm font-bold">{row.loginTime ? dayjs(row.loginTime).format("hh:mm A") : "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Out</p>
                    <p className="text-sm font-bold">{row.logoutTime ? dayjs(row.logoutTime).format("hh:mm A") : "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Work</p>
                    <p className="text-sm font-bold text-blue-600">{formatMinutes(row.workedMinutes)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SKELETON LOADING STATE */}
          {loading && (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredData.length === 0 && (
            <div className="py-24 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-slate-300 w-10 h-10" />
              </div>
              <p className="text-slate-900 dark:text-white font-bold">No records found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search or date filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatMinutes(mins = 0) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function StatusBadge({ status }) {
  const config = {
    present: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "half-day": "bg-amber-50 text-amber-700 border-amber-100",
    absent: "bg-rose-50 text-rose-700 border-rose-100"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest border transition-all ${config[status] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${status === 'present' ? 'bg-emerald-500' : status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
      {status.toUpperCase()}
    </span>
  );
}