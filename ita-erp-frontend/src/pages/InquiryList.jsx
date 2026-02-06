import { useEffect, useState } from "react";
import { getInquiries, createInquiry, updateInquiry } from "../services/inquiryService";
import { toast } from "react-hot-toast";
import { 
  FiPlus, FiPhone, FiCalendar, FiSearch, 
  FiEdit, FiX, FiActivity, FiAlertCircle, FiUser 
} from "react-icons/fi";
import { format, isToday } from "date-fns";

export default function InquiryList() {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const [form, setForm] = useState({ 
    clientName: "", 
    phone: "", 
    requirement: "", 
    source: "Cold Call", 
    nextFollowUpDate: "" 
  });
  
  const [updateData, setUpdateData] = useState({ 
    status: "", 
    adminRemark: "", 
    nextFollowUpDate: "" 
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInquiries();
      setList(res.data);
      setFiltered(res.data);
    } catch (err) { 
      toast.error("Load failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const res = list.filter(i => 
      i.clientName.toLowerCase().includes(search.toLowerCase()) || i.phone.includes(search)
    );
    setFiltered(res);
  }, [search, list]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInquiry(form);
      toast.success("Lead Captured! 🎯");
      setShowAddModal(false);
      setForm({ clientName: "", phone: "", requirement: "", source: "Cold Call", nextFollowUpDate: "" });
      loadData();
    } catch (err) {
      toast.error("Failed to save lead");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateData.adminRemark) return toast.error("Please add a follow-up remark");
    try {
      await updateInquiry(selectedInquiry._id, updateData);
      toast.success("Follow-up logged! ✅");
      setShowEditModal(false);
      loadData();
    } catch (err) { 
      toast.error("Update failed"); 
    }
  };

  const getStatusColor = (s) => {
    const colors = { 
      Converted: "bg-emerald-50 text-emerald-700 border-emerald-100", 
      Lost: "bg-rose-50 text-rose-700 border-rose-100", 
      "Follow-up": "bg-amber-50 text-amber-700 border-amber-100" 
    };
    return colors[s] || "bg-blue-50 text-blue-700 border-blue-100";
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center font-black text-slate-300 animate-pulse tracking-widest text-xs uppercase">
        Initializing Lead Engine...
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-500 pb-24 md:pb-10">
      
      {/* Summary Header */}
      <header className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 italic tracking-tighter">
            Lead <span className="text-indigo-600">Engine</span>
          </h2>
          <div className="flex gap-2 mt-2">
            <span className="text-[9px] md:text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-3 py-1 rounded-lg border border-amber-200">
              {list.filter(i => i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate))).length} Today
            </span>
            <span className="text-[9px] md:text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border border-slate-200">
              {list.length} Total
            </span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2 transition-all hover:bg-slate-900">
            <FiPlus size={18}/> <span className="text-sm">Capture Lead</span>
          </button>
        </div>
      </header>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map(i => (
          <div key={i._id} className={`bg-white border rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-sm relative transition-all active:scale-[0.98] md:active:scale-100 hover:shadow-lg ${i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate)) ? 'ring-2 ring-amber-500 border-transparent' : 'border-slate-100'}`}>
            
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black">
                  {i.employee?.name?.charAt(0) || <FiUser size={10}/>}
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-400 uppercase leading-none tracking-widest">Handled By</p>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-800">{i.employee?.name || "Unassigned"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-black text-slate-400 uppercase leading-none tracking-widest">Captured</p>
                <p className="text-[8px] md:text-[9px] font-bold text-indigo-600">{format(new Date(i.createdAt), "dd MMM, hh:mm a")}</p>
              </div>
            </div>

            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-black uppercase border ${getStatusColor(i.status)}`}>
                {i.status}
              </span>
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {i.source}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight mb-1 truncate">{i.clientName}</h3>
            <p className="text-[10px] md:text-[11px] text-slate-500 font-bold flex items-center gap-1 mb-4">
              <FiPhone size={12} className="text-indigo-500"/> {i.phone}
            </p>
            
            <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 mb-5 space-y-2.5">
               <div className="relative">
                  <p className="text-[7px] font-black text-slate-300 uppercase absolute -top-1.5 left-0 bg-slate-50 px-1">Requirement</p>
                  <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed pt-1 line-clamp-2">"{i.requirement}"</p>
               </div>
               
               <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Action</span>
                     <span className="text-[9px] font-bold text-indigo-600">
                       {i.lastActionTime ? format(new Date(i.lastActionTime), "hh:mm a") : format(new Date(i.createdAt), "hh:mm a")}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Next Call</span>
                     <span className="text-[9px] font-bold text-amber-600">
                       {i.nextFollowUpDate ? format(new Date(i.nextFollowUpDate), "dd MMM") : "TBD"}
                     </span>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => { 
                setSelectedInquiry(i); 
                setUpdateData({status: i.status, nextFollowUpDate: i.nextFollowUpDate?.split('T')[0], adminRemark: ""}); 
                setShowEditModal(true); 
              }}
              className="w-full py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-md"
            >
              <FiActivity/> Log Update
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: LOG ACTIVITY */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-t-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95">
             <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                   <h3 className="text-xl sm:text-2xl font-black text-slate-900 italic">Log <span className="text-indigo-600">Activity</span></h3>
                   <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{selectedInquiry?.clientName}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-300 hover:text-slate-900"><FiX size={24}/></button>
             </div>
             
             <form onSubmit={handleUpdate} className="space-y-4">
                <div className="max-h-32 sm:max-h-40 overflow-y-auto bg-slate-50 p-4 rounded-xl text-[10px] sm:text-[11px] text-slate-600 whitespace-pre-wrap mb-4 border border-slate-100">
                   <p className="font-black text-slate-400 mb-1 uppercase text-[8px] tracking-widest">History:</p>
                   {selectedInquiry?.adminRemark || "Initial capture - No history yet."}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest ml-1">Status</label>
                      <select className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-xs" value={updateData.status} onChange={e => setUpdateData({...updateData, status: e.target.value})}>
                         {["New", "Follow-up", "Quotation Sent", "Converted", "Lost"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest ml-1">Next Call</label>
                      <input type="date" className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-xs" value={updateData.nextFollowUpDate} onChange={e => setUpdateData({...updateData, nextFollowUpDate: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest ml-1">Call Remarks</label>
                   <textarea className="w-full p-4 rounded-xl bg-slate-50 border-none resize-none text-sm font-medium" rows="3" placeholder="Conversation details..." required value={updateData.adminRemark} onChange={e => setUpdateData({...updateData, adminRemark: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl sm:rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-lg">
                  Update Lead
                </button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LEAD */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 italic">Capture <span className="text-indigo-600">Lead</span></h2>
                  <p className="text-[8px] sm:text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                    By: {user.name?.split(' ')[0] || "Staff"}
                  </p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-300"><FiX size={24}/></button>
             </div>

             <form onSubmit={handleAddSubmit} className="space-y-3.5">
                <input type="text" placeholder="Client Name" className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-sm" required value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} />
                <input type="tel" placeholder="Phone Number" className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-sm" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <textarea placeholder="Requirements..." className="w-full p-4 rounded-xl bg-slate-50 border-none resize-none font-medium text-sm" rows="3" required value={form.requirement} onChange={e => setForm({...form, requirement: e.target.value})} />

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Source</label>
                      <select className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-xs" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                        <option>Google</option><option>Facebook</option><option>Reference</option><option>Cold Call</option><option>Walking</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Next Follow-up</label>
                      <input type="date" className="w-full p-3.5 rounded-xl bg-slate-50 border-none font-bold text-xs" value={form.nextFollowUpDate} onChange={e => setForm({...form, nextFollowUpDate: e.target.value})} />
                   </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-xl uppercase text-[10px] font-black tracking-widest active:scale-95 transition-all">
                    Capture & Sync
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}