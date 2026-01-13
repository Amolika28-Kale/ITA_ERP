import { useEffect, useState } from "react";
import { fetchDailyAttendance } from "../services/adminAttendanceService";
import dayjs from "dayjs";
import { Calendar, Users, Clock, AlertCircle, ChevronRight } from "lucide-react";

export default function AdminAttendance() {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const stats = [
    { label: "Total Staff", value: data?.data?.length || 0, icon: Users, color: "text-blue-600" },
    { label: "Present", value: data?.data?.filter(r => r.status === 'present').length || 0, icon: Clock, color: "text-green-600" },
    { label: "Absent", value: data?.data?.filter(r => r.status === 'absent').length || 0, icon: AlertCircle, color: "text-rose-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Attendance Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Manage and monitor daily staff activity.</p>
          </div>

          <div className="relative inline-flex items-center">
            <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* DESKTOP TABLE (Visible on md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Log Times</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && data?.data.map(row => (
                  <tr key={row.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{row.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{row.role}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">{row.loginTime ? dayjs(row.loginTime).format("hh:mm A") : "—"}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-rose-600 font-medium">{row.logoutTime ? dayjs(row.logoutTime).format("hh:mm A") : "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-700">
                      {formatMinutes(row.workedMinutes)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST (Visible on < md) */}
          <div className="md:hidden divide-y divide-slate-100">
            {!loading && data?.data.map(row => (
              <div key={row.userId} className="p-4 space-y-3 active:bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{row.name}</h3>
                    <p className="text-xs text-slate-500 uppercase">{row.role}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-sm">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">In</p>
                    <p className="font-semibold">{row.loginTime ? dayjs(row.loginTime).format("hh:mm A") : "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Out</p>
                    <p className="font-semibold">{row.logoutTime ? dayjs(row.logoutTime).format("hh:mm A") : "—"}</p>
                  </div>
                  <div className="text-center border-l pl-3">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                    <p className="font-semibold">{formatMinutes(row.workedMinutes)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LOADING & EMPTY STATES */}
          {loading && (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Fetching records...</p>
            </div>
          )}

          {!loading && data?.data.length === 0 && (
            <div className="p-16 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-slate-300 w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">No attendance records for this date.</p>
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
  return `${h}h ${m}m`;
}

function StatusBadge({ status }) {
  const config = {
    present: "bg-green-50 text-green-700 ring-green-600/20",
    "half-day": "bg-amber-50 text-amber-700 ring-amber-600/20",
    absent: "bg-rose-50 text-rose-700 ring-rose-600/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset ${config[status] || "bg-slate-50 text-slate-600 ring-slate-600/20"}`}>
      {status.toUpperCase()}
    </span>
  );
}