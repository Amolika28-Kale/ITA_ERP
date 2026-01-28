import { useEffect, useState, useMemo } from "react";
import { fetchDailyAttendance } from "../services/adminAttendanceService";
import dayjs from "dayjs";
import { Calendar, Users, Search, UserCheck, UserMinus, Info, User } from "lucide-react";

export default function AdminAttendance() {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all"); // ✅ नवीन स्टेट

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

  // ✅ सर्व कर्मचाऱ्यांची नावे ड्रॉपडाउनसाठी काढणे (Unique List)
  const employeeList = useMemo(() => {
    const list = data?.data || [];
    return [...new Set(list.map(emp => emp.name))].sort();
  }, [data]);

  // ✅ LOGIC: Filter by Dropdown AND Search AND Default View
  const filteredData = useMemo(() => {
    let list = data?.data || [];
    
    // 1. ड्रॉपडाउन फिल्टर (विशिष्ट कर्मचारी)
    if (selectedEmployee !== "all") {
      list = list.filter(emp => emp.name === selectedEmployee);
      return list; // जर ड्रॉपडाउन वापरला असेल तर 'Absent' सुद्धा दाखवा
    }

    // 2. सर्च बार फिल्टर
    if (searchTerm.trim()) {
      return list.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. डिफॉल्ट: फक्त हजर (Present/Half-day) लोक दाखवा
    return list.filter(emp => emp.status !== 'absent');

  }, [data, searchTerm, selectedEmployee]);

  const stats = useMemo(() => [
    { label: "Total Staff", value: data?.data?.length || 0, icon: Users, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Present Today", value: data?.data?.filter(r => r.status === 'present').length || 0, icon: UserCheck, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Absent", value: data?.data?.filter(r => r.status === 'absent').length || 0, icon: UserMinus, color: "rose", bg: "bg-rose-50", text: "text-rose-600" },
  ], [data]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md py-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Workforce <span className="text-blue-600">Attendance</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">Monitoring logs for {dayjs(date).format("MMMM D, YYYY")}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* ✅ Employee Dropdown Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  setSearchTerm(""); // ड्रॉपडाउन निवडल्यावर सर्च रिकामा करा
                }}
                className="w-full sm:w-48 pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none shadow-sm focus:border-blue-500 appearance-none"
              >
                <option value="all">All Employees</option>
                {employeeList.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedEmployee("all"); // सर्च करताना ड्रॉपडाउन रिसेट करा
                }}
                className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
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

        {/* INFO BADGE */}
        <div className="flex justify-between items-center px-6">
          <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
            {selectedEmployee !== "all" ? `Filtered: ${selectedEmployee}` : searchTerm ? `Search Results` : `Active Staff Details`} 
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-black">{filteredData.length}</span>
          </h3>
          {selectedEmployee === "all" && !searchTerm && (
            <div className="flex items-center gap-1.5 text-blue-600 animate-pulse">
              <Info size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">Default: Showing Present Only</span>
            </div>
          )}
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
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Achievement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!loading && filteredData.map(row => (
                  <tr key={row.userId} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg uppercase">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{row.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{row.role || "Employee"}</div>
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
                      <span className={`font-mono font-bold px-3 py-1 rounded-full text-xs ${row.workedMinutes > 0 ? "text-blue-600 bg-blue-50" : "text-gray-400 bg-gray-50"}`}>
                        {formatMinutes(row.workedMinutes)}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-10 py-5 max-w-xl">
                      <div className="flex items-center">
                        {row.achievement ? (
                          <span className="text-sm text-gray-800 leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all">
                            {row.achievement}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not submitted</span>
                        )}
                        {!row.achievement && row.status !== "absent" && (
                          <span className="ml-2 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-1.5 py-0.5 rounded">Missing</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY STATE */}
          {!loading && filteredData.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-200 w-10 h-10" />
              </div>
              <p className="text-gray-900 font-bold">No matching records</p>
              <p className="text-gray-400 text-sm mt-1">Try changing filters or searching for another term.</p>
              <button onClick={() => { setSelectedEmployee("all"); setSearchTerm(""); }} className="text-blue-600 text-sm font-bold mt-4 underline">Clear All Filters</button>
            </div>
          )}

          {/* LOADING SKELETON */}
          {loading && (
            <div className="p-10 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 w-full bg-gray-50 animate-pulse rounded-3xl" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatMinutes(mins = 0) {
  if (mins === 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function StatusBadge({ status }) {
  const config = {
    present: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "half-day": "bg-amber-50 text-amber-600 border-amber-100",
    absent: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all ${config[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status.toUpperCase()}
    </span>
  );
}