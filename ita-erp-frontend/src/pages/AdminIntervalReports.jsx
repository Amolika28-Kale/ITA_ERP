import { useEffect, useState } from "react";
import { getAllStaffReports } from "../services/staffreportService";
import { FiClock, FiDownload, FiCalendar, FiFilter, FiUser, FiRotateCcw, FiTag } from "react-icons/fi";
import { format, isSameDay } from "date-fns";

// Predefined time slots
const TIME_SLOTS = [
  { id: 1, startTime: "10:00", endTime: "12:00", label: "Morning Slot (10AM - 12PM)", display: "10:00 AM – 12:00 PM" },
  { id: 2, startTime: "12:00", endTime: "15:00", label: "Afternoon Slot (12PM - 3PM)", display: "12:00 PM – 3:00 PM" },
  { id: 3, startTime: "17:00", endTime: "18:00", label: "Evening Slot (5PM - 6PM)", display: "5:00 PM – 6:00 PM" },
];

export default function AdminReportLedger() {
  const [allReports, setAllReports] = useState([]); 
  const [filteredReports, setFilteredReports] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const defaultDate = format(new Date(), "yyyy-MM-dd");
  const defaultEmployee = "all";
  const defaultSlot = "all";

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedEmployee, setSelectedEmployee] = useState(defaultEmployee);
  const [selectedSlot, setSelectedSlot] = useState(defaultSlot);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getAllStaffReports();
      setAllReports(res.data);
      applyFilters(res.data, selectedDate, selectedEmployee, selectedSlot);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports");
      setLoading(false);
    }
  };

  // Get unique employees from reports
  const uniqueEmployees = [
    ...new Map(allReports.map((item) => [item.employee?._id, item.employee])).values(),
  ].filter(emp => emp !== undefined);

  // Apply all filters (date, employee, slot)
  const applyFilters = (data, dateStr, empId, slotId) => {
    let result = data;
    
    // Filter by date
    result = result.filter(r => isSameDay(new Date(r.submittedAt), new Date(dateStr)));
    
    // Filter by employee
    if (empId !== "all") {
      result = result.filter(r => r.employee?._id === empId);
    }
    
    // Filter by time slot
    if (slotId !== "all") {
      const selectedSlotData = TIME_SLOTS.find(s => s.id === parseInt(slotId));
      if (selectedSlotData) {
        result = result.filter(r => {
          // Check if report has timeSlot field (new structure)
          if (r.timeSlot) {
            return r.timeSlot.startTime === selectedSlotData.startTime && 
                   r.timeSlot.endTime === selectedSlotData.endTime;
          }
          // Fallback for old intervalSlot field
          return r.intervalSlot === selectedSlotData.label;
        });
      }
    }
    
    setFilteredReports(result);
  };

  const resetFilters = () => {
    setSelectedDate(defaultDate);
    setSelectedEmployee(defaultEmployee);
    setSelectedSlot(defaultSlot);
    applyFilters(allReports, defaultDate, defaultEmployee, defaultSlot);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    applyFilters(allReports, newDate, selectedEmployee, selectedSlot);
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    applyFilters(allReports, selectedDate, empId, selectedSlot);
  };

  const handleSlotChange = (e) => {
    const slotId = e.target.value;
    setSelectedSlot(slotId);
    applyFilters(allReports, selectedDate, selectedEmployee, slotId);
  };

  const exportToCSV = () => {
    const headers = ["Employee Name", "Time Slot", "Submission Time", "Work Report"].join(",");
    const rows = filteredReports.map(r => {
      // Get slot display name
      let slotDisplay = r.intervalSlot || "N/A";
      if (r.timeSlot) {
        const slot = TIME_SLOTS.find(s => s.startTime === r.timeSlot.startTime);
        slotDisplay = slot ? slot.display : `${r.timeSlot.startTime} - ${r.timeSlot.endTime}`;
      }
      
      return [
        r.employee?.name || "N/A",
        slotDisplay,
        format(new Date(r.submittedAt), "dd MMM yyyy - hh:mm a"),
        `"${r.reportText.replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.body.appendChild(document.createElement("a"));
    link.href = encodeURI(csvContent);
    link.download = `Audit_Report_${selectedDate}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  // Get counts for each slot
  const getSlotCounts = () => {
    const counts = {};
    TIME_SLOTS.forEach(slot => {
      const slotReports = filteredReports.filter(r => {
        if (r.timeSlot) {
          return r.timeSlot.startTime === slot.startTime && r.timeSlot.endTime === slot.endTime;
        }
        return r.intervalSlot === slot.label;
      });
      counts[slot.id] = slotReports.length;
    });
    return counts;
  };

  const slotCounts = getSlotCounts();

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em] text-xs md:text-base">Auditing Master Records...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in">
      
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center lg:text-left w-full lg:w-auto">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tight">
            Staff <span className="text-indigo-600">Work Logs</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em] mt-1">Manual Time Slot Audit Ledger</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Employee Filter */}
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

          {/* Date Filter */}
          <div className="relative w-full sm:w-auto sm:flex-1 lg:flex-none">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={16} />
            <input 
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer"
            />
          </div>

          {/* Time Slot Filter - NEW */}
          <div className="relative w-full sm:w-auto sm:flex-1 lg:flex-none">
            <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={16} />
            <select 
              value={selectedSlot}
              onChange={handleSlotChange}
              className="pl-11 pr-8 py-3 bg-slate-50 border-none rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer appearance-none"
            >
              <option value="all">All Slots</option>
              {TIME_SLOTS.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.display} {slotCounts[slot.id] > 0 ? `(${slotCounts[slot.id]})` : ''}
                </option>
              ))}
            </select>
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

            {/* Export Button */}
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

      {/* Filter Info & Summary Cards */}
      <div className="space-y-4">
        {/* Filter Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400 shrink-0" size={14} />
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
              Found {filteredReports.length} reports for {format(new Date(selectedDate), "dd MMM yyyy")}
            </span>
          </div>
          {(selectedEmployee !== "all" || selectedDate !== defaultDate || selectedSlot !== "all") && (
             <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
               Filters Active
             </span>
          )}
        </div>

        {/* Slot Summary Cards - NEW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_SLOTS.map(slot => {
            const count = filteredReports.filter(r => {
              if (r.timeSlot) {
                return r.timeSlot.startTime === slot.startTime && r.timeSlot.endTime === slot.endTime;
              }
              return r.intervalSlot === slot.label;
            }).length;
            
            return (
              <div 
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id.toString())}
                className={`bg-white p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedSlot === slot.id.toString() 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-slate-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    {slot.display}
                  </span>
                  <span className={`text-xs font-black ${
                    count > 0 ? 'text-indigo-600' : 'text-slate-300'
                  }`}>
                    {count} reports
                  </span>
                </div>
                <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${(count / (filteredReports.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 md:gap-6">
        {filteredReports.map((r) => {
          // Get slot display name
          let slotDisplay = r.intervalSlot || "N/A";
          let slotColor = "bg-indigo-50 text-indigo-600";
          
          if (r.timeSlot) {
            const slot = TIME_SLOTS.find(s => s.startTime === r.timeSlot.startTime);
            slotDisplay = slot ? slot.display : `${r.timeSlot.startTime} - ${r.timeSlot.endTime}`;
            
            // Different colors for different slots
            if (slot?.id === 1) slotColor = "bg-amber-50 text-amber-600";
            if (slot?.id === 2) slotColor = "bg-emerald-50 text-emerald-600";
            if (slot?.id === 3) slotColor = "bg-purple-50 text-purple-600";
          }

          return (
            <div key={r._id} className="group bg-white border border-slate-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-indigo-100 hover:shadow-2xl transition-all flex flex-col md:flex-row gap-5 md:gap-8">
              
              {/* Side Info */}
              <div className="w-full md:w-1/4 space-y-3 border-b md:border-b-0 md:border-r border-slate-50 pb-5 md:pb-0 md:pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100 uppercase text-xs">
                    {r.employee?.name?.charAt(0)}
                  </div>
                  <p className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-tight truncate">{r.employee?.name}</p>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                  <p className={`text-[8px] md:text-[9px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-tighter ${slotColor}`}>
                    {slotDisplay}
                  </p>
                  <div className="text-[9px] md:text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <FiClock size={12}/> {format(new Date(r.submittedAt), "hh:mm a")}
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="w-full md:w-3/4 flex items-center">
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed italic font-medium whitespace-pre-wrap break-words">
                  "{r.reportText}"
                </p>
              </div>
            </div>
          );
        })}
        
        {filteredReports.length === 0 && (
          <div className="text-center py-16 md:py-24 bg-slate-50 rounded-[1.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-200">
            <FiUser className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase italic tracking-widest text-[10px] md:text-sm px-4">
              No matching work logs found for selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}