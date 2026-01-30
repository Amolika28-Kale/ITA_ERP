import { useEffect, useState } from "react";
import { getInquiries } from "../services/inquiryService";
import { toast } from "react-hot-toast";
import { 
  FiSearch, FiDownload, FiTrendingUp, FiPieChart, 
  FiClock, FiAlertCircle, FiUser, FiActivity, FiArrowRight
} from "react-icons/fi";
import { format, isToday } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminInquiryLedger() {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [empFilter, setEmpFilter] = useState("all");
  const [loading, setLoading] = useState(true);

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
    if (search) {
      result = result.filter(i => 
        i.clientName.toLowerCase().includes(search.toLowerCase()) || 
        i.employee?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (empFilter !== "all") {
      result = result.filter(i => i.employee?._id === empFilter);
    }
    setFiltered(result);
  }, [search, empFilter, list]);

  const exportAdminPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Master Inquiry Audit Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 28);

    const tableData = filtered.map(i => [
      i.clientName, 
      i.employee?.name || "N/A", 
      i.requirement, 
      i.status, 
      i.createdAt ? format(new Date(i.createdAt), "dd/MM/yy") : "-"
    ]);

    // ✅ FIXED: Use the autoTable function directly
    autoTable(doc, {
      head: [["Client", "Assigned To", "Requirement", "Status", "Date"]],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8, font: "helvetica" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`Master_Leads_Report_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const stats = {
    conversionRate: list.length > 0 ? ((list.filter(i => i.status === "Converted").length / list.length) * 100).toFixed(1) : 0,
    todaysActions: list.filter(i => i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate))).length
  };

  const uniqueEmployees = [...new Map(list.map(item => [item.employee?._id, item.employee])).values()];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">Syncing Master Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10 animate-in fade-in duration-500">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-100/40 border border-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-10">
          <div className="text-center xl:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
               <FiActivity size={14} /> System Master Audit
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
              Inquiry <span className="text-indigo-600">Master Ledger</span>
            </h1>
            <p className="text-slate-400 mt-4 font-medium text-sm md:text-lg max-w-xl">
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
            <StatCard label="Master Leads" value={list.length} icon={<FiPieChart/>} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard label="Avg. Win Rate" value={`${stats.conversionRate}%`} icon={<FiTrendingUp/>} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Pending" value={list.filter(i=>i.status==="Follow-up").length} icon={<FiClock/>} color="text-amber-600" bg="bg-amber-50" />
            <StatCard label="Urgent" value={stats.todaysActions} icon={<FiAlertCircle/>} color="text-rose-600" bg="bg-rose-50" />
          </div>
        </div>
      </div>

      {/* --- FILTER & ACTION BAR --- */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" placeholder="Search master records..." 
            className="w-full pl-16 pr-6 py-6 rounded-3xl bg-white border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all shadow-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="w-full lg:w-72 px-8 py-6 rounded-3xl bg-white border border-slate-100 text-[11px] font-black uppercase text-slate-500 outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-all appearance-none"
          value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}
        >
          <option value="all">Global (All Members)</option>
          {uniqueEmployees.map(emp => emp && (
            <option key={emp._id} value={emp._id}>{emp.name}</option>
          ))}
        </select>

        <button 
          onClick={exportAdminPDF} 
          className="w-full lg:w-auto bg-slate-900 hover:bg-indigo-600 text-white px-10 py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <FiDownload size={18}/> Export Report
        </button>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Specialist</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Details</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(i => (
                <tr key={i._id} className="hover:bg-indigo-50/30 transition-all cursor-default group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100">
                        {i.employee?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{i.employee?.name || "Unassigned"}</p>
                        <p className="text-[10px] text-indigo-500 font-bold uppercase">{i.employee?.role || "Team Member"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="font-black text-slate-900 text-base">{i.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-xs font-bold text-slate-400">{i.phone}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="max-w-xs">
                       <p className="text-xs text-slate-600 font-medium italic leading-relaxed line-clamp-2">
                         "{i.requirement || "No specific details provided."}"
                       </p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border shadow-sm ${getStatusColor(i.status)}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col items-center">
                      <p className={`font-black text-sm ${isToday(new Date(i.nextFollowUpDate)) ? 'text-rose-500' : 'text-slate-700'}`}>
                        {i.nextFollowUpDate ? format(new Date(i.nextFollowUpDate), "dd MMM") : "---"}
                      </p>
                      <p className="text-[9px] font-black text-slate-300 uppercase">Follow Up</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <FiSearch size={40} />
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">No records match your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center text-2xl shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black text-slate-900`}>{value}</p>
      </div>
    </div>
  );
}

function getStatusColor(s) {
  if (s === "Converted") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "Lost") return "bg-rose-50 text-rose-700 border-rose-100";
  if (s === "Follow-up") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-indigo-50 text-indigo-700 border-indigo-100";
}