import { useEffect, useState } from "react";
import { getInquiries, updateInquiry } from "../services/inquiryService";
import { toast } from "react-hot-toast";
import { 
  FiSearch, FiFilter, FiDownload, FiUser, FiCalendar, FiTrendingUp, FiPieChart, 
  FiClock,
  FiAlertCircle
} from "react-icons/fi";
import { format, isToday } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AdminInquiryLedger() {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [empFilter, setEmpFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInquiries();
      setList(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error("डेटा लोड करण्यात एरर आली");
    } finally {
      setLoading(false);
    }
  };

  // ॲडमिनसाठी प्रगत फिल्टरिंग (Search + Employee Name)
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
    doc.text("Master Inquiry Audit Report", 14, 15);
    const tableData = filtered.map(i => [
      i.clientName, 
      i.employee?.name || "N/A", 
      i.requirement, 
      i.status, 
      i.createdAt ? format(new Date(i.createdAt), "dd/MM/yy") : "-"
    ]);
    doc.autoTable({ 
      head: [["Client", "Assigned To", "Requirement", "Status", "Date"]], 
      body: tableData, 
      startY: 20,
      headStyles: { fillColor: [49, 46, 129] } // Dark Indigo for Admin
    });
    doc.save("Admin_Master_Leads.pdf");
  };
  const stats = {
  conversionRate: ((list.filter(i => i.status === "Converted").length / list.length) * 100).toFixed(1),
  todaysActions: list.filter(i => i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate))).length
};

  // एम्प्लॉयी लिस्ट काढणे (Dropdown साठी)
  const uniqueEmployees = [...new Map(list.map(item => [item.employee?._id, item.employee])).values()];

  if (loading) return <div className="p-20 text-center font-black text-slate-300">ADMIN SYNCING...</div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 animate-in fade-in">
      
      {/* ॲडमिन हेडर्स वरील स्टॅट्स */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Master <span className="text-indigo-600">Ledger</span></h2>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest font-black">Control Center / Inquiry Management</p>
        </div>
        
        <div className="flex gap-4">
          <AdminStatCard label="Total Leads" value={list.length} icon={<FiPieChart/>} color="text-indigo-600" />
          <AdminStatCard label="Converted" value={list.filter(i=>i.status==="Converted").length} icon={<FiTrendingUp/>} color="text-emerald-600" />
          <button onClick={exportAdminPDF} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
            <FiDownload/> Export Master Report
          </button>
        </div>
      </div>

      {/* ॲडमिन फिल्टर्स */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Search by Client or Employee Name..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-6 py-4 rounded-2xl bg-slate-50 border-none text-[10px] font-black uppercase text-slate-500 outline-none"
          value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}
        >
          <option value="all">All Employees</option>
          {uniqueEmployees.map(emp => emp && (
            <option key={emp._id} value={emp._id}>{emp.name}</option>
          ))}
        </select>
      </div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
  <AdminStatCard label="Total Leads" value={list.length} icon={<FiPieChart/>} color="text-indigo-600" />
  <AdminStatCard label="Conversion" value={`${stats.conversionRate}%`} icon={<FiTrendingUp/>} color="text-emerald-600" />
  <AdminStatCard label="Active Follow-ups" value={list.filter(i=>i.status==="Follow-up").length} icon={<FiClock/>} color="text-amber-600" />
  <AdminStatCard label="Today's Backlog" value={stats.todaysActions} icon={<FiAlertCircle/>} color="text-rose-600" />
</div>
      {/* मास्टर टेबल */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Assigned To</th>
                <th className="px-8 py-6">Client Details</th>
                <th className="px-8 py-6">Requirement</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-center">Last Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(i => (
                <tr key={i._id} className="hover:bg-indigo-50/20 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                        {i.employee?.name?.charAt(0)}
                      </div>
                      <p className="font-black text-slate-700 text-xs uppercase">{i.employee?.name || "Unknown"}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-800 text-sm">{i.clientName}</p>
                    <p className="text-[10px] text-slate-400 font-black">{i.phone}</p>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-500 italic max-w-[200px] truncate">
                    "{i.requirement}"
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(i.status)}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center text-[10px] font-black text-slate-400">
                    {i.nextFollowUpDate ? format(new Date(i.nextFollowUpDate), "dd MMM yyyy") : "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white px-8 py-4 rounded-2xl border flex items-center gap-4 shadow-sm">
      <div className={`text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function getStatusColor(s) {
  if (s === "Converted") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "Lost") return "bg-rose-50 text-rose-700 border-rose-100";
  return "bg-amber-50 text-amber-700 border-amber-100";
}