import { useEffect, useState } from "react";
import { getAllStaffReports } from "../services/staffreportService";
import { FiClock, FiDownload, FiCalendar, FiFilter, FiUser, FiRotateCcw } from "react-icons/fi";
import { format, isSameDay } from "date-fns";

export default function AdminReportLedger() {
  const [allReports, setAllReports] = useState([]); 
  const [filteredReports, setFilteredReports] = useState([]); 
  const [loading, setLoading] = useState(true);
  
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

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em] text-xs md:text-base">Auditing Master Records...</div>;

  return (
    // p-4 मोबाईलवर, p-6 डेस्कटॉपवर
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in">
      
      {/* Header Section: मोबाईलवर पँडिंग कमी केली आणि स्टॅकिंग केले */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center lg:text-left w-full lg:w-auto">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tight">
            Staff <span className="text-indigo-600">Work Logs</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em] mt-1">Manual 3-Hour Audit Ledger</p>
        </div>

        {/* Filters: मोबाईलवर पूर्ण विड्थ आणि एकाखाली एक */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
          
          <div className="relative w-full sm:w-auto sm:flex-1 lg:flex-none">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={16} />
            <select 
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="pl-11 pr-8 py-3 bg-slate-50 border-none rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer appearance-none"
            >
              <option value="all">All Employees</option>
              {uniqueEmployees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-auto sm:flex-1 lg:flex-none">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={16} />
            <input 
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Reset Button */}
            <button 
              onClick={resetFilters}
              title="Reset Filters"
              className="p-3 bg-slate-100 text-slate-500 rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              <FiRotateCcw size={18} />
            </button>

            <button 
              onClick={exportToCSV}
              disabled={filteredReports.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiDownload size={16} /> Export
            </button>
          </div>
        </div>
      </header>

      {/* Filter Info: मोबाईलवर सेंटर अलाइनमेंट */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <FiFilter className="text-slate-400 shrink-0" size={14} />
          <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
            Found {filteredReports.length} reports for {format(new Date(selectedDate), "dd MMM yyyy")}
          </span>
        </div>
        {(selectedEmployee !== "all" || selectedDate !== defaultDate) && (
           <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
             Filters Active
           </span>
        )}
      </div>

      {/* Report Cards: मोबाईलवर माहितीची मांडणी बदलली */}
      <div className="grid gap-4 md:gap-6">
        {filteredReports.map((r) => (
          <div key={r._id} className="group bg-white border border-slate-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-indigo-100 hover:shadow-2xl transition-all flex flex-col md:flex-row gap-5 md:gap-8">
            
            {/* Side Info: मोबाईलवर खालची बॉर्डर आणि डेस्कटॉपवर साईड बॉर्डर */}
            <div className="w-full md:w-1/4 space-y-3 border-b md:border-b-0 md:border-r border-slate-50 pb-5 md:pb-0 md:pr-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100 uppercase text-xs">
                  {r.employee?.name?.charAt(0)}
                </div>
                <p className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-tight truncate">{r.employee?.name}</p>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                <p className="text-[8px] md:text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit uppercase tracking-tighter">
                  {r.intervalSlot}
                </p>
                <div className="text-[9px] md:text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <FiClock size={12}/> {format(new Date(r.submittedAt), "hh:mm a")}
                </div>
              </div>
            </div>

            {/* Report Content: मोबाईलवर फॉन्ट साईझ आणि पँडिंग ॲडजस्ट केली */}
            <div className="w-full md:w-3/4 flex items-center">
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed italic font-medium whitespace-pre-wrap break-words">
                "{r.reportText}"
              </p>
            </div>
          </div>
        ))}
        
        {filteredReports.length === 0 && (
          <div className="text-center py-16 md:py-24 bg-slate-50 rounded-[1.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-200">
            <FiUser className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase italic tracking-widest text-[10px] md:text-sm px-4">
              No matching work logs found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}