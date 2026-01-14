import { useEffect, useState, useMemo } from "react";
import { fetchDailyAttendance } from "../services/adminAttendanceService";
import dayjs from "dayjs";
import { Calendar, Users, Search, UserCheck, UserMinus } from "lucide-react";

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

  // Performance Optimization: Prevent recalculation on every render
  const filteredData = useMemo(() => {
    return data?.data?.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [data, searchTerm]);

  const stats = useMemo(() => [
    { label: "Total Staff", value: data?.data?.length || 0, icon: Users, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Present Today", value: data?.data?.filter(r => r.status === 'present').length || 0, icon: UserCheck, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Absent", value: data?.data?.filter(r => r.status === 'absent').length || 0, icon: UserMinus, color: "rose", bg: "bg-rose-50", text: "text-rose-600" },
  ], [data]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Workforce <span className="text-blue-600">Attendance</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">Monitoring logs for {dayjs(date).format("MMMM D, YYYY")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            {/* Date Picker */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none shadow-sm focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="relative z-10 flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.text}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Employee</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Log Times</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Duration</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!loading && filteredData.map(row => (
                  <tr key={row.userId} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{row.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">{row.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-bold">
                          {row.loginTime ? dayjs(row.loginTime).format("hh:mm A") : "--:--"}
                        </span>
                        <span className="text-gray-300">→</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-bold">
                          {row.logoutTime ? dayjs(row.logoutTime).format("hh:mm A") : "--:--"}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-center">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs">
                        {formatMinutes(row.workedMinutes)}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SKELETON & EMPTY STATES */}
          {loading && (
            <div className="p-10 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 w-full bg-gray-50 animate-pulse rounded-3xl" />
              ))}
            </div>
          )}

          {!loading && filteredData.length === 0 && (
            <div className="py-24 text-center">
              <Search className="text-gray-200 w-16 h-16 mx-auto mb-4" />
              <p className="text-gray-900 font-bold">No records for this search</p>
              <button onClick={() => setSearchTerm("")} className="text-blue-600 text-sm font-semibold mt-1">Clear filters</button>
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
    present: "bg-emerald-100 text-emerald-700 border-emerald-200",
    "half-day": "bg-amber-100 text-amber-700 border-amber-200",
    absent: "bg-rose-100 text-rose-700 border-rose-200"
  };

  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all ${config[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status.toUpperCase()}
    </span>
  );
}