import { useEffect, useState } from "react";
import { getAllRequests, updateRequestStatus } from "../services/requestService";
import { toast } from "react-hot-toast";
import { 
  FiCheck, FiX, FiSearch, FiFilter, FiCalendar, FiAlertCircle, FiClock, FiSend, FiDownload 
} from "react-icons/fi";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AllRequests() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");
  const [actionStatus, setActionStatus] = useState(""); 

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllRequests();
      setList(res.data);
      setFilteredList(res.data);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    let result = list;
    if (search) {
      result = result.filter(r => 
        r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (typeFilter !== "all") {
      result = result.filter(r => r.requestType === typeFilter);
    }
    if (startDate && endDate) {
      result = result.filter(r => {
        const reqDate = new Date(r.createdAt);
        return isWithinInterval(reqDate, {
          start: startOfDay(new Date(startDate)),
          end: endOfDay(new Date(endDate))
        });
      });
    }
    setFilteredList(result);
  }, [search, statusFilter, typeFilter, startDate, endDate, list]);

  const openActionModal = (request, status) => {
    setSelectedRequest(request);
    setActionStatus(status);
    setAdminRemark(""); 
    setModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    try {
      await updateRequestStatus(selectedRequest._id, { status: actionStatus, adminRemark });
      toast.success(`Request ${actionStatus} successfully`);
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Organization Request Ledger", 14, 20);
    const tableColumn = ["Employee", "Type", "Subject", "Status", "Dates", "Priority"];
    const tableRows = filteredList.map(r => [
      r.user?.name || "Unknown",
      r.requestType,
      r.title,
      r.status,
      r.fromDate ? `${format(new Date(r.fromDate), "dd/MM")} - ${format(new Date(r.toDate), "dd/MM")}` : "N/A",
      r.priority
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30, theme: 'grid', headStyles: { fillColor: [79, 70, 229] } });
    doc.save("Global_Requests_Audit.pdf");
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Loading Ledger Details...</div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Global <span className="text-indigo-600">Ledger</span></h2>
          <p className="text-slate-500 mt-1 font-medium">Full detail audit of all employee requests.</p>
        </div>
        <div className="flex gap-4">
          <StatCard label="Active Requests" value={list.filter(r=>r.status==="Pending").length} color="text-amber-600" bg="bg-amber-50" />
          <button onClick={exportPDF} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-600 transition-all active:scale-95">
            <FiDownload /> Download Audit
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Search employee, title..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 rounded-2xl bg-slate-50 border-none text-xs font-black uppercase text-slate-500 outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="px-4 py-3 rounded-2xl bg-slate-50 border-none text-xs font-black uppercase text-slate-500 outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {["Leave", "Permission", "Asset", "Support", "Approval", "Complaint"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-slate-50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FiCalendar/> Date Range:</span>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input type="date" className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="text-slate-300">to</span>
            <input type="date" className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE TABLE */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Subject</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status/Remark</th>
                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredList.map(r => (
                <tr key={r._id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {r.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{r.user?.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Applied: {format(new Date(r.createdAt), "dd MMM")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black uppercase mb-1 inline-block ${getTypeStyles(r.requestType)}`}>{r.requestType}</span>
                    <p className="font-bold text-slate-700 text-sm leading-tight">{r.title}</p>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs text-slate-500 font-medium italic line-clamp-2 max-w-[200px]" title={r.description}>
                      "{r.description}"
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    {r.fromDate ? (
                      <div className="text-[10px] font-bold text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1"><FiCalendar size={10} className="text-indigo-400"/> {format(new Date(r.fromDate), "dd MMM")}</p>
                        <p className="flex items-center gap-1"><FiCalendar size={10} className="text-indigo-400"/> {format(new Date(r.toDate), "dd MMM")}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${r.priority === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>
                      {r.priority === 'High' && <FiAlertCircle size={10}/>} {r.priority}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border mb-2 inline-block ${getStatusStyles(r.status)}`}>{r.status}</span>
                    {r.adminRemark && <p className="text-[9px] text-slate-400 italic font-medium truncate max-w-[120px]">Rem: {r.adminRemark}</p>}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center items-center gap-2">
                      {r.status === "Pending" ? (
                        <>
                          <button onClick={() => openActionModal(r, "Approved")} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><FiCheck size={16}/></button>
                          <button onClick={() => openActionModal(r, "Rejected")} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><FiX size={16}/></button>
                        </>
                      ) : (
                        <div className="text-slate-200"><FiCheck size={18}/></div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`h-2 ${actionStatus === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div className="p-10 space-y-6">
              <div className="flex justify-between items-start">
                 <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Confirm {actionStatus}</h3>
                 <button onClick={() => setModalOpen(false)} className="text-slate-300 hover:text-slate-900"><FiX size={24}/></button>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Request Subject</p>
                 <p className="text-sm font-bold text-slate-700 mb-1">{selectedRequest?.title}</p>
                 <p className="text-xs text-slate-500 italic">"{selectedRequest?.description}"</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Admin Feedback</label>
                <textarea 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium resize-none transition-all"
                  placeholder="Explain why this decision was made..." rows="3"
                  value={adminRemark} onChange={(e) => setAdminRemark(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleFinalSubmit} className={`flex-[2] py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all ${actionStatus === 'Approved' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'}`}>
                  Submit Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function StatCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} ${color} px-8 py-3 rounded-2xl flex flex-col items-center border border-white shadow-sm`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function getTypeStyles(type) {
  const t = type?.toLowerCase();
  if (t === 'leave') return 'bg-orange-100 text-orange-600';
  if (t === 'asset') return 'bg-purple-100 text-purple-600';
  if (t === 'permission') return 'bg-pink-100 text-pink-600';
  return 'bg-sky-100 text-sky-600';
}

function getStatusStyles(status) {
  if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Rejected') return 'bg-rose-50 text-rose-700 border-rose-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
}