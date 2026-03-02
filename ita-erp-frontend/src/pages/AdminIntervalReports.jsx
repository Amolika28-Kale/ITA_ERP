import { useEffect, useState } from "react";
import { getAllStaffReports } from "../services/staffreportService";
import { 
  FiClock, FiDownload, FiCalendar, FiFilter, FiUser, 
  FiRotateCcw, FiTag, FiBarChart2, FiUsers, FiEye 
} from "react-icons/fi";
import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

// Predefined time slots (update to hourly slots as needed)
const TIME_SLOTS = [
  { id: 1, startTime: "09:00", endTime: "10:00", label: "Hour 1 (9AM-10AM)", display: "09:00 – 10:00" },
  { id: 2, startTime: "10:00", endTime: "11:00", label: "Hour 2 (10AM-11AM)", display: "10:00 – 11:00" },
  { id: 3, startTime: "11:00", endTime: "12:00", label: "Hour 3 (11AM-12PM)", display: "11:00 – 12:00" },
  { id: 4, startTime: "12:00", endTime: "13:00", label: "Hour 4 (12PM-1PM)", display: "12:00 – 13:00" },
  { id: 5, startTime: "13:00", endTime: "14:00", label: "Hour 5 (1PM-2PM)", display: "13:00 – 14:00" },
  { id: 6, startTime: "14:00", endTime: "15:00", label: "Hour 6 (2PM-3PM)", display: "14:00 – 15:00" },
  { id: 7, startTime: "15:00", endTime: "16:00", label: "Hour 7 (3PM-4PM)", display: "15:00 – 16:00" },
  { id: 8, startTime: "16:00", endTime: "17:00", label: "Hour 8 (4PM-5PM)", display: "16:00 – 17:00" },
  { id: 9, startTime: "17:00", endTime: "18:00", label: "Hour 9 (5PM-6PM)", display: "17:00 – 18:00" },
];

export default function AdminReportLedger() {
  const [allReports, setAllReports] = useState([]); 
  const [filteredReports, setFilteredReports] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState("day"); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedSlot, setSelectedSlot] = useState("all");
  
  // Statistics
  const [reportStats, setReportStats] = useState({
    total: 0,
    byEmployee: {},
    bySlot: {}
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (allReports.length > 0) {
      applyAllFilters();
    }
  }, [dateFilter, selectedDate, selectedEmployee, selectedSlot, allReports]);

  const fetchReports = async () => {
    try {
      const res = await getAllStaffReports();
      setAllReports(res.data);
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

  // Apply all filters based on selected criteria
  const applyAllFilters = () => {
    let result = [...allReports];
    
    // Apply date filter based on selection
    const today = new Date(selectedDate);
    
    if (dateFilter === "day") {
      // Filter by specific day
      result = result.filter(r => isSameDay(new Date(r.submittedAt), today));
    } else if (dateFilter === "week") {
      // Filter by week
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
      result = result.filter(r => {
        const reportDate = new Date(r.submittedAt);
        return reportDate >= weekStart && reportDate <= weekEnd;
      });
    } else if (dateFilter === "month") {
      // Filter by month
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      result = result.filter(r => {
        const reportDate = new Date(r.submittedAt);
        return reportDate >= monthStart && reportDate <= monthEnd;
      });
    }
    
    // Filter by employee
    if (selectedEmployee !== "all") {
      result = result.filter(r => r.employee?._id === selectedEmployee);
    }
    
    // Filter by time slot
    if (selectedSlot !== "all") {
      const selectedSlotData = TIME_SLOTS.find(s => s.id === parseInt(selectedSlot));
      if (selectedSlotData) {
        result = result.filter(r => {
          if (r.timeSlot) {
            return r.timeSlot.startTime === selectedSlotData.startTime && 
                   r.timeSlot.endTime === selectedSlotData.endTime;
          }
          return r.intervalSlot === selectedSlotData.label;
        });
      }
    }
    
    setFilteredReports(result);
    calculateStats(result);
  };

  // Calculate statistics for filtered reports
  const calculateStats = (reports) => {
    const stats = {
      total: reports.length,
      byEmployee: {},
      bySlot: {}
    };

    reports.forEach(report => {
      // Employee stats
      const empId = report.employee?._id || 'unknown';
      if (!stats.byEmployee[empId]) {
        stats.byEmployee[empId] = {
          name: report.employee?.name || 'Unknown',
          count: 0
        };
      }
      stats.byEmployee[empId].count++;

      // Slot stats
      if (report.timeSlot) {
        const slotKey = `${report.timeSlot.startTime}-${report.timeSlot.endTime}`;
        if (!stats.bySlot[slotKey]) {
          stats.bySlot[slotKey] = {
            startTime: report.timeSlot.startTime,
            endTime: report.timeSlot.endTime,
            count: 0
          };
        }
        stats.bySlot[slotKey].count++;
      }
    });

    setReportStats(stats);
  };

  const resetFilters = () => {
    setDateFilter("day");
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedEmployee("all");
    setSelectedSlot("all");
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleSlotChange = (e) => {
    setSelectedSlot(e.target.value);
  };

  const exportToCSV = () => {
    const headers = ["Employee Name", "Date", "Time Slot", "Submission Time", "Work Report"].join(",");
    const rows = filteredReports.map(r => {
      let slotDisplay = r.intervalSlot || "N/A";
      if (r.timeSlot) {
        const slot = TIME_SLOTS.find(s => s.startTime === r.timeSlot.startTime);
        slotDisplay = slot ? slot.display : `${r.timeSlot.startTime} - ${r.timeSlot.endTime}`;
      }
      
      return [
        r.employee?.name || "N/A",
        format(new Date(r.submittedAt), "dd MMM yyyy"),
        slotDisplay,
        format(new Date(r.submittedAt), "hh:mm a"),
        `"${r.reportText.replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.body.appendChild(document.createElement("a"));
    link.href = encodeURI(csvContent);
    link.download = `Reports_${dateFilter}_${selectedDate}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  // Get counts for each slot in filtered results
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Loading Reports...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in">
      
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-br from-slate-900 to-indigo-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tight">
            Staff <span className="text-indigo-300">Work Logs</span>
          </h2>
          <p className="text-indigo-200/70 text-xs font-bold uppercase tracking-widest mt-1">
            Master Audit Ledger • {filteredReports.length} Reports
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p className="text-[8px] font-black text-indigo-300 uppercase">Employees</p>
            <p className="text-lg font-black text-white">{uniqueEmployees.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p className="text-[8px] font-black text-indigo-300 uppercase">Reports</p>
            <p className="text-lg font-black text-white">{filteredReports.length}</p>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6 space-y-4">
        
        {/* Date Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider self-center mr-2">
            <FiCalendar className="inline mr-1" size={12} /> Period:
          </span>
          {["day", "week", "month"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleDateFilterChange(filter)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                dateFilter === filter
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter === "day" ? "Daily" : filter === "week" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Date Picker */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" size={14} />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Employee Filter */}
          <div className="relative">
            <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" size={14} />
            <select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              <option value="all">All Staff Members</option>
              {uniqueEmployees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Slot Filter */}
          <div className="relative">
            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" size={14} />
            <select
              value={selectedSlot}
              onChange={handleSlotChange}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              <option value="all">All Time Slots</option>
              {TIME_SLOTS.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.display} {slotCounts[slot.id] > 0 ? `(${slotCounts[slot.id]})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="flex-1 px-3 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-1"
            >
              <FiRotateCcw size={12} />
              Reset
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredReports.length === 0}
              className="flex-1 px-3 py-2.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <FiDownload size={12} />
              Export
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedEmployee !== "all" || selectedSlot !== "all" || dateFilter !== "day") && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Filters:
            </span>
            {dateFilter !== "day" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[8px] font-black uppercase">
                {dateFilter === "week" ? "Weekly" : "Monthly"}
              </span>
            )}
            {selectedEmployee !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[8px] font-black uppercase">
                Staff: {uniqueEmployees.find(e => e._id === selectedEmployee)?.name}
              </span>
            )}
            {selectedSlot !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[8px] font-black uppercase">
                Slot: {TIME_SLOTS.find(s => s.id === parseInt(selectedSlot))?.display}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {filteredReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Reports */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-2xl font-black text-indigo-600">{filteredReports.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              {dateFilter === "day" ? "Today" : dateFilter === "week" ? "This Week" : "This Month"}
            </p>
          </div>

          {/* Employees Count */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Active Employees</p>
            <p className="text-2xl font-black text-emerald-600">{Object.keys(reportStats.byEmployee).length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Submitted reports</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Completion Rate</p>
            <p className="text-2xl font-black text-amber-600">
              {Math.round((filteredReports.length / (TIME_SLOTS.length * Object.keys(reportStats.byEmployee).length || 1)) * 100)}%
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Per employee per slot</p>
          </div>
        </div>
      )}

      {/* Slot Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1">
        {TIME_SLOTS.map(slot => {
          const count = slotCounts[slot.id] || 0;
          return (
            <div
              key={slot.id}
              onClick={() => handleSlotChange({ target: { value: slot.id.toString() } })}
              className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
                selectedSlot === slot.id.toString()
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-slate-100 hover:border-indigo-200 bg-white'
              }`}
            >
              <span className="text-[6px] sm:text-[8px] font-black text-slate-500 uppercase block">
                {slot.display.split('–')[0]}
              </span>
              <span className={`text-xs sm:text-sm font-black ${
                count > 0 ? 'text-indigo-600' : 'text-slate-300'
              }`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <FiBarChart2 className="text-indigo-600" size={16} />
          <span className="text-xs font-bold text-slate-600">
            Found <span className="text-indigo-600">{filteredReports.length}</span> reports
          </span>
        </div>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
          {dateFilter === "day" ? "Daily" : dateFilter === "week" ? "Weekly" : "Monthly"} View
        </span>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 md:gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((r) => {
            let slotDisplay = r.intervalSlot || "N/A";
            let slotColor = "bg-indigo-50 text-indigo-600";
            
            if (r.timeSlot) {
              const slot = TIME_SLOTS.find(s => s.startTime === r.timeSlot.startTime);
              slotDisplay = slot ? slot.display : `${r.timeSlot.startTime} - ${r.timeSlot.endTime}`;
              
              // Color coding for slots
              const colors = [
                "bg-amber-50 text-amber-600",
                "bg-orange-50 text-orange-600",
                "bg-yellow-50 text-yellow-600",
                "bg-lime-50 text-lime-600",
                "bg-emerald-50 text-emerald-600",
                "bg-teal-50 text-teal-600",
                "bg-cyan-50 text-cyan-600",
                "bg-sky-50 text-sky-600",
                "bg-blue-50 text-blue-600"
              ];
              slotColor = colors[(parseInt(r.timeSlot.startTime.split(':')[0]) - 9) % colors.length];
            }

            return (
              <div key={r._id} className="group bg-white border border-slate-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-5 md:gap-8">
                
                {/* Side Info */}
                <div className="w-full md:w-1/4 space-y-3 border-b md:border-b-0 md:border-r border-slate-50 pb-5 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {r.employee?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{r.employee?.name}</p>
                      <p className="text-[8px] font-bold text-indigo-600 uppercase">{r.employee?.role || 'Staff'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full ${slotColor}`}>
                      {slotDisplay}
                    </span>
                    <div className="text-[8px] text-slate-400 font-bold flex items-center gap-1">
                      <FiClock size={10}/> {format(new Date(r.submittedAt), "dd MMM, hh:mm a")}
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="w-full md:w-3/4">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                    {r.reportText}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 md:py-24 bg-slate-50 rounded-[1.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-200">
            <FiEye className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase italic tracking-widest text-xs md:text-sm px-4">
              No reports found for selected filters
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
          ITA-ERP • Master Report Ledger • {filteredReports.length} Reports
        </p>
      </div>
    </div>
  );
}