import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests, deleteRequest } from "../services/requestService";
import { toast } from "react-hot-toast";
import { FiCalendar, FiTrash2, FiEdit, FiLock, FiPlus, FiSearch, FiFilter, FiChevronRight } from "react-icons/fi";
import { format } from "date-fns";

export default function MyRequests() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMyRequests();
      setList(res.data || []);
      setFilteredList(res.data || []);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    let temp = list;
    if (searchQuery) {
      temp = temp.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (typeFilter !== "All") {
      temp = temp.filter(r => r.requestType === typeFilter);
    }
    setFilteredList(temp);
  }, [searchQuery, typeFilter, list]);

  const getStatusStyle = (s) => {
    switch (s) {
      case "Approved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-500 pb-24 md:pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight italic">My <span className="text-blue-600">Requests</span></h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base font-medium">Manage and track your internal applications.</p>
        </div>
        <button 
          onClick={() => navigate("/create-request")} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <FiPlus size={20} /> <span className="text-sm uppercase tracking-widest">New Request</span>
        </button>
      </div>

      {/* Filter Bar - Responsive Layout */}
      <div className="bg-white p-2.5 md:p-4 rounded-[1.5rem] md:rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            className="w-full md:w-auto pl-12 pr-10 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm font-bold text-slate-600 appearance-none cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            {["Leave", "Permission", "Asset", "Support", "Approval", "Complaint", "Other"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 animate-pulse text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Data...</div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 md:py-24 bg-white rounded-[2rem] md:rounded-[3rem] border-2 md:border-4 border-dashed border-slate-100 px-6">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">No matching requests</h3>
          <p className="text-slate-400 mt-2 text-sm">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-12 px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className="col-span-3">Subject & Type</div>
            <div className="col-span-3">Duration / Date</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Admin Remarks</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {filteredList.map((r) => (
            <div key={r._id} className="bg-white border border-slate-100 shadow-sm rounded-2xl md:rounded-3xl p-5 md:p-6 md:grid md:grid-cols-12 md:items-center hover:shadow-md transition-all group">
              
              {/* Title & Type */}
              <div className="col-span-3 mb-3 md:mb-0">
                <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{r.title}</h4>
                <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {r.requestType}
                </span>
              </div>

              {/* Mobile Separator (Hidden on desktop) */}
              <div className="md:hidden h-px bg-slate-50 my-3" />

              {/* Dates */}
              <div className="col-span-3 mb-3 md:mb-0">
                {(r.requestType === "Leave" || r.requestType === "Permission") && r.fromDate ? (
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-xl w-fit">
                    <FiCalendar size={14} className="text-blue-500" />
                    <span className="text-[11px] md:text-xs font-bold">
                      {format(new Date(r.fromDate), "dd MMM")} - {format(new Date(r.toDate), "dd MMM yyyy")}
                    </span>
                  </div>
                ) : <span className="text-slate-300 italic text-xs">No dates set</span>}
              </div>

              {/* Priority - Badge style on mobile */}
              <div className="col-span-1 mb-3 md:mb-0 flex items-center">
                 <span className="md:hidden text-[10px] text-slate-400 uppercase font-black mr-2">Priority:</span>
                 <span className="text-[10px] font-bold uppercase text-slate-500">{r.priority}</span>
              </div>

              {/* Status */}
              <div className="col-span-2 mb-4 md:mb-0">
                <span className={`inline-flex px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(r.status)}`}>
                  {r.status}
                </span>
              </div>

              {/* Admin Remarks */}
              <div className="col-span-2 text-xs md:text-sm text-slate-400 italic mb-4 md:mb-0 truncate pr-4">
                {r.adminRemark ? `"${r.adminRemark}"` : <span className="opacity-20">No remarks yet</span>}
              </div>

              {/* Actions - Bottom bar on mobile */}
              <div className="col-span-1 flex justify-end gap-2 pt-3 md:pt-0 border-t md:border-none border-slate-50">
                {r.status === "Pending" ? (
                  <>
                    <button onClick={() => navigate(`/edit-request/${r._id}`)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><FiEdit size={18} /></button>
                    <button onClick={async () => {
                      if (window.confirm("Permanent Delete?")) {
                        await deleteRequest(r._id);
                        loadData();
                        toast.success("Request Removed");
                      }
                    }} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><FiTrash2 size={18} /></button>
                  </>
                ) : (
                  <div className="text-slate-300 px-3 py-2 bg-slate-50 rounded-xl flex items-center gap-1">
                    <FiLock size={12}/>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Read Only</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}