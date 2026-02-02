import { useEffect, useState } from "react";
import { getAllStaffReports } from "../services/staffreportService";
import { FiClock, FiDownload, FiCalendar, FiFilter, FiUser, FiRotateCcw } from "react-icons/fi";
import { format, isSameDay } from "date-fns";

export default function AdminReportLedger() {
  const [allReports, setAllReports] = useState([]); 
  const [filteredReports, setFilteredReports] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // मूळ स्थिती (Default States)
  const defaultDate = format(new Date(), "yyyy-MM-dd");
  const defaultEmployee = "all";

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedEmployee, setSelectedEmployee] = useState(defaultEmployee);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getAllStaffReports();
      setAllReports(res.data);
      applyFilters(res.data, selectedDate, selectedEmployee);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports");
      setLoading(false);
    }
  };

  const uniqueEmployees = [
    ...new Map(allReports.map((item) => [item.employee?._id, item.employee])).values(),
  ].filter(emp => emp !== undefined);

  const applyFilters = (data, dateStr, empId) => {
    let result = data;
    result = result.filter(r => isSameDay(new Date(r.submittedAt), new Date(dateStr)));
    if (empId !== "all") {
      result = result.filter(r => r.employee?._id === empId);
    }
    setFilteredReports(result);
  };

  // ✅ फिल्टर्स रीसेट करण्याचे फंक्शन
  const resetFilters = () => {
    setSelectedDate(defaultDate);
    setSelectedEmployee(defaultEmployee);
    applyFilters(allReports, defaultDate, defaultEmployee);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    applyFilters(allReports, newDate, selectedEmployee);
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    applyFilters(allReports, selectedDate, empId);
  };

  const exportToCSV = () => {
    const headers = ["Employee Name", "Slot", "Submission Time", "Work Report"].join(",");
    const rows = filteredReports.map(r => [
      r.employee?.name || "N/A",
      r.intervalSlot,
      format(new Date(r.submittedAt), "dd MMM yyyy - hh:mm a"),
      `"${r.reportText.replace(/"/g, '""')}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.body.appendChild(document.createElement("a"));
    link.href = encodeURI(csvContent);
    link.download = `Audit_Report_${selectedDate}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">Auditing Master Records...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">
            Staff <span className="text-indigo-600">Work Logs</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Manual 3-Hour Audit Ledger</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          
          <div className="relative flex-1 lg:flex-none">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={18} />
            <select 
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="pl-12 pr-10 py-3 bg-slate-50 border-none rounded-2xl font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer appearance-none"
            >
              <option value="all">All Employees</option>
              {uniqueEmployees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 lg:flex-none">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={18} />
            <input 
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            {/* ✅ Reset Button */}
            <button 
              onClick={resetFilters}
              title="Reset Filters"
              className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              <FiRotateCcw size={18} />
            </button>

            <button 
              onClick={exportToCSV}
              disabled={filteredReports.length === 0}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiDownload size={16} /> Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <FiFilter className="text-slate-400" size={14} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Found {filteredReports.length} reports for {format(new Date(selectedDate), "dd MMMM yyyy")}
          </span>
        </div>
        {(selectedEmployee !== "all" || selectedDate !== defaultDate) && (
           <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
             Filters Active
           </span>
        )}
      </div>

      <div className="grid gap-6">
        {filteredReports.map((r) => (
          <div key={r._id} className="group bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-indigo-100 hover:shadow-2xl transition-all flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4 space-y-3 border-b md:border-b-0 md:border-r border-slate-50 pb-6 md:pb-0 md:pr-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100 uppercase">
                  {r.employee?.name?.charAt(0)}
                </div>
                <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{r.employee?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit uppercase tracking-tighter">
                  {r.intervalSlot}
                </p>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-2">
                  <FiClock size={12}/> {format(new Date(r.submittedAt), "hh:mm a")}
                </div>
              </div>
            </div>

            <div className="md:w-3/4 flex items-center">
              <p className="text-slate-600 text-sm leading-relaxed italic font-medium whitespace-pre-wrap">
                "{r.reportText}"
              </p>
            </div>
          </div>
        ))}
        
        {filteredReports.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <FiUser className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase italic tracking-widest text-sm">
              No matching work logs found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}