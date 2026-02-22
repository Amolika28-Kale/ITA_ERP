import { useEffect, useState } from "react";
import { getInquiries } from "../services/inquiryService";
import { toast } from "react-hot-toast";
import { 
  FiSearch, FiDownload, FiTrendingUp, FiPieChart, 
  FiClock, FiAlertCircle, FiUser, FiActivity, FiArrowRight,
  FiFilter, FiX, FiCalendar, FiPhone, FiTag
} from "react-icons/fi";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminInquiryLedger() {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [empFilter, setEmpFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInquiries();
      setList(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error("Failed to sync master ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = list;
    
    // Search filter
    if (search) {
      result = result.filter(i => 
        i.clientName?.toLowerCase().includes(search.toLowerCase()) || 
        i.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.phone?.includes(search) ||
        i.requirement?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Employee filter
    if (empFilter !== "all") {
      result = result.filter(i => i.employee?._id === empFilter);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== "all") {
      result = result.filter(i => {
        const date = new Date(i.createdAt);
        if (dateFilter === "today") return isToday(date);
        if (dateFilter === "week") return isThisWeek(date);
        if (dateFilter === "month") return isThisMonth(date);
        return true;
      });
    }
    
    setFiltered(result);
  }, [search, empFilter, statusFilter, dateFilter, list]);

  const clearFilters = () => {
    setSearch("");
    setEmpFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const exportAdminPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Master Inquiry Audit Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 28);
    doc.text(`Filters: ${statusFilter !== "all" ? statusFilter : "All Status"} | ${dateFilter !== "all" ? dateFilter : "All Time"}`, 14, 35);

    const tableData = filtered.map(i => [
      i.clientName, 
      i.employee?.name || "N/A", 
      i.requirement?.substring(0, 50) + (i.requirement?.length > 50 ? "..." : ""), 
      i.status, 
      i.createdAt ? format(new Date(i.createdAt), "dd/MM/yy") : "-",
      i.nextFollowUpDate ? format(new Date(i.nextFollowUpDate), "dd/MM/yy") : "-"
    ]);

    autoTable(doc, {
      head: [["Client", "Assigned To", "Requirement", "Status", "Created", "Follow-up"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 7, font: "helvetica" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`Inquiry_Report_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
    toast.success("Report exported successfully!");
  };

  const stats = {
    total: list.length,
    converted: list.filter(i => i.status === "Converted").length,
    followUp: list.filter(i => i.status === "Follow-up").length,
    lost: list.filter(i => i.status === "Lost").length,
    conversionRate: list.length > 0 ? ((list.filter(i => i.status === "Converted").length / list.length) * 100).toFixed(1) : 0,
    todaysActions: list.filter(i => i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate))).length
  };

  const uniqueEmployees = [...new Map(list.map(item => [item.employee?._id, item.employee])).values()].filter(Boolean);
  const statuses = ["all", ...new Set(list.map(i => i.status))].filter(Boolean);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* ================= HERO SECTION ================= */}
        <section aria-label="Dashboard Header" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-indigo-500/20 blur-[80px] rounded-full" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-3 sm:mb-4">
                <FiActivity size={12} />
                System Master Audit
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                Inquiry <span className="text-indigo-300">Ledger</span>
              </h1>
              <p className="text-indigo-200/70 text-xs sm:text-sm mt-2 max-w-xl">
                Master oversight panel • {filtered.length} of {list.length} records
              </p>
            </div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
              <StatCard label="Total" value={stats.total} icon={<FiPieChart/>} color="text-indigo-600" bg="bg-indigo-50/90" />
              <StatCard label="Converted" value={stats.converted} icon={<FiTrendingUp/>} color="text-emerald-600" bg="bg-emerald-50/90" />
              <StatCard label="Follow-up" value={stats.followUp} icon={<FiClock/>} color="text-amber-600" bg="bg-amber-50/90" />
              <StatCard label="Today" value={stats.todaysActions} icon={<FiAlertCircle/>} color="text-rose-600" bg="bg-rose-50/90" />
            </div>
          </div>
        </section>

        {/* ================= FILTERS SECTION ================= */}
        <section aria-label="Search and Filters" className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-100 shadow-lg p-4 sm:p-6">
          
          {/* Mobile Filter Toggle */}
          <div className="flex lg:hidden items-center gap-3 mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1 flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-200"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <FiFilter size={16} />
                Filters
              </span>
              <span className="text-xs text-slate-400">
                {empFilter !== "all" || statusFilter !== "all" || dateFilter !== "all" ? "Active" : "All"}
              </span>
            </button>
            
            <button
              onClick={exportAdminPDF}
              className="bg-indigo-600 text-white p-3 rounded-xl"
              aria-label="Export report"
            >
              <FiDownload size={20} />
            </button>
          </div>

          {/* Filter Bar - Desktop & Mobile Expandable */}
          <div className={`${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              
              {/* Search Input */}
              <div className="flex-1 relative group">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search client, employee, phone..." 
                  className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>

              {/* Filter Selects - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <select 
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={empFilter} 
                  onChange={(e) => setEmpFilter(e.target.value)}
                >
                  <option value="all">All Members</option>
                  {uniqueEmployees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>

                <select 
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="New">New</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>

                <select 
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Export Button - Desktop */}
              <button 
                onClick={exportAdminPDF} 
                className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-200"
              >
                <FiDownload size={16} />
                Export PDF
              </button>
            </div>

            {/* Active Filters */}
            {(search || empFilter !== "all" || statusFilter !== "all" || dateFilter !== "all") && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">Active filters:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                    Search: "{search}"
                  </span>
                )}
                {empFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                    Member: {uniqueEmployees.find(e => e._id === empFilter)?.name}
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                    Status: {statusFilter}
                  </span>
                )}
                {dateFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                    {dateFilter}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-500 hover:text-rose-600 ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ================= RESULTS COUNT ================= */}
        <div className="flex items-center justify-between px-2">
          <p className="text-xs sm:text-sm text-slate-600">
            Showing <span className="font-bold text-indigo-600">{filtered.length}</span> of {list.length} inquiries
          </p>
          <p className="text-[9px] sm:text-xs text-slate-400">
            Updated {format(new Date(), "hh:mm a")}
          </p>
        </div>

        {/* ================= TABLE SECTION ================= */}
        <section aria-label="Inquiry Records" className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
          
          {/* Mobile Card View */}
          <div className="block lg:hidden divide-y divide-slate-50">
            {filtered.length > 0 ? (
              filtered.map(i => (
                <article key={i._id} className="p-4 hover:bg-indigo-50/30 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {i.employee?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm">{i.clientName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <FiUser size={10} />
                        {i.employee?.name || "Unassigned"}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase ${getStatusColor(i.status)}`}>
                      {i.status}
                    </span>
                  </div>

                  <div className="space-y-2 pl-13">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      "{i.requirement || "No details"}"
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-400">
                      {i.phone && (
                        <span className="flex items-center gap-1">
                          <FiPhone size={9} />
                          {i.phone}
                        </span>
                      )}
                      {i.nextFollowUpDate && (
                        <span className={`flex items-center gap-1 ${isToday(new Date(i.nextFollowUpDate)) ? 'text-rose-500 font-bold' : ''}`}>
                          <FiCalendar size={9} />
                          {format(new Date(i.nextFollowUpDate), "dd MMM")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiClock size={9} />
                        {format(new Date(i.createdAt), "dd MMM")}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Specialist</th>
                  <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Inquiry</th>
                  <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(i => (
                  <TableRow key={i._id} inquiry={i} />
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && <EmptyState />}
        </section>

        {/* Footer */}
        <footer className="text-center pt-4">
          <p className="text-[8px] font-medium text-slate-300 uppercase tracking-[0.2em]">
            ITA-ERP • Master Inquiry Ledger
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className={`${bg} backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`${color} text-base sm:text-lg`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[8px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</p>
          <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TableRow({ inquiry: i }) {
  return (
    <tr className="hover:bg-indigo-50/30 transition-colors">
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs">
            {i.employee?.name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs">{i.employee?.name || "Unassigned"}</p>
            <p className="text-[9px] text-indigo-500 font-medium">{i.employee?.role || "Member"}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="font-bold text-slate-900 text-sm">{i.clientName}</p>
        {i.phone && (
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <FiPhone size={9} />
            {i.phone}
          </p>
        )}
      </td>
      <td className="px-8 py-6">
        <p className="text-xs text-slate-600 italic line-clamp-2 max-w-xs">
          "{i.requirement || "No details"}"
        </p>
      </td>
      <td className="px-8 py-6">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase ${getStatusColor(i.status)}`}>
          {i.status}
        </span>
      </td>
      <td className="px-8 py-6 text-center">
        {i.nextFollowUpDate ? (
          <div>
            <p className={`font-bold text-sm ${isToday(new Date(i.nextFollowUpDate)) ? 'text-rose-500' : 'text-slate-700'}`}>
              {format(new Date(i.nextFollowUpDate), "dd MMM")}
            </p>
            <p className="text-[8px] font-bold text-slate-300 uppercase">Follow-up</p>
          </div>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiSearch size={24} className="text-slate-300" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">No inquiries found</h3>
      <p className="text-xs text-slate-400">Try adjusting your filters</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-sm font-medium text-slate-500">Loading master ledger...</p>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    "Converted": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Lost": "bg-rose-50 text-rose-700 border-rose-100",
    "Follow-up": "bg-amber-50 text-amber-700 border-amber-100",
    "New": "bg-blue-50 text-blue-700 border-blue-100"
  };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-100";
}