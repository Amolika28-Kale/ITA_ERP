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

  // ✅ Get current logged-in user info
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
    <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-500">
      
      {/* Summary Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter">
            Lead <span className="text-indigo-600">Engine</span>
          </h2>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-3 py-1 rounded-lg border border-amber-200">
              {list.filter(i => i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate))).length} Today's Follow-ups
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-2 transition-all hover:bg-slate-900">
            <FiPlus size={20}/> Capture Lead
          </button>
        </div>
      </header>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(i => (
          <div key={i._id} className={`bg-white border rounded-[2rem] p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-xl group ${i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate)) ? 'ring-2 ring-amber-500' : 'border-slate-100'}`}>
            
            {/* Handled By & Timestamp Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black border border-slate-200">
                  {i.employee?.name?.charAt(0) || <FiUser size={12}/>}
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-400 uppercase leading-none tracking-widest">Handled By</p>
                  <p className="text-[10px] font-black text-slate-800">{i.employee?.name || "Unassigned"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-black text-slate-400 uppercase leading-none tracking-widest">Captured</p>
                <p className="text-[9px] font-bold text-indigo-600">{format(new Date(i.createdAt), "dd MMM, hh:mm a")}</p>
              </div>
            </div>

            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusColor(i.status)}`}>
                {i.status}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">
                {i.source}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1">{i.clientName}</h3>
            <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mb-5">
              <FiPhone size={12} className="text-indigo-500"/> {i.phone}
            </p>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-3">
               <div className="relative">
                  <p className="text-[8px] font-black text-slate-300 uppercase absolute -top-2 left-0 bg-slate-50 px-1">Requirement</p>
                  <p className="text-xs text-slate-600 font-medium italic leading-relaxed pt-1">"{i.requirement}"</p>
               </div>
               
               <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Action</span>
                     <span className="text-[10px] font-bold text-indigo-600">
                       {i.lastActionTime ? format(new Date(i.lastActionTime), "hh:mm a") : format(new Date(i.createdAt), "hh:mm a")}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Follow-up</span>
                     <span className="text-[10px] font-bold text-amber-600">
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
              className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
            >
              <FiActivity/> Log Update
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: LOG ACTIVITY (Follow-up) */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 italic">Log <span className="text-indigo-600">Activity</span></h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedInquiry?.clientName}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><FiX size={24}/></button>
             </div>
             
             <form onSubmit={handleUpdate} className="space-y-4">
                <div className="max-h-40 overflow-y-auto bg-slate-50 p-5 rounded-2xl text-[11px] text-slate-600 whitespace-pre-wrap mb-4 border border-slate-100 shadow-inner">
                   <p className="font-black text-slate-400 mb-2 uppercase text-[9px] tracking-widest">Communication History:</p>
                   {selectedInquiry?.adminRemark || "Initial capture - No history yet."}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-2">Progress Status</label>
                      <select className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-xs focus:ring-2 focus:ring-indigo-500" value={updateData.status} onChange={e => setUpdateData({...updateData, status: e.target.value})}>
                         {["New", "Follow-up", "Quotation Sent", "Converted", "Lost"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-2">Next Scheduled Call</label>
                      <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-xs focus:ring-2 focus:ring-indigo-500" value={updateData.nextFollowUpDate} onChange={e => setUpdateData({...updateData, nextFollowUpDate: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-2">Activity Remark (Details of Call)</label>
                   <textarea className="w-full p-4 rounded-xl bg-slate-50 border-none resize-none text-sm font-medium focus:ring-2 focus:ring-indigo-500" rows="3" placeholder="Explain what happened during the conversation..." required value={updateData.adminRemark} onChange={e => setUpdateData({...updateData, adminRemark: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all hover:bg-slate-900">
                  Submit Log & Update Status
                </button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LEAD (Capture) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
             
             {/* Header with Auto Date/Time Display */}
             <div className="flex justify-between items-start mb-8">
               <div>
                 <h2 className="text-2xl font-black text-slate-900 italic">Capture <span className="text-indigo-600">New Lead</span></h2>
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                   <FiUser size={10}/> Logged by: {user.name || "System Staff"}
                 </p>
               </div>
               <div className="text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Entry Timestamp</p>
                 <p className="text-xs font-black text-slate-800">{format(new Date(), "dd MMM, yyyy")}</p>
                 <p className="text-[10px] font-bold text-indigo-600 uppercase">{format(new Date(), "hh:mm a")}</p>
               </div>
             </div>

             <form onSubmit={handleAddSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Client Full Name" 
                  className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                  required 
                  value={form.clientName} 
                  onChange={e => setForm({...form, clientName: e.target.value})} 
                />
                
                <input 
                  type="text" 
                  placeholder="Primary Phone (WhatsApp)" 
                  className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                  required 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                />

                <textarea 
                  placeholder="Client Requirement / Product Interest..." 
                  className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-sm" 
                  rows="3" 
                  required 
                  value={form.requirement} 
                  onChange={e => setForm({...form, requirement: e.target.value})} 
                />

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Lead Source</label>
                      <select className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-xs" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                        <option>Google</option>
                        <option>Facebook</option>
                        <option>Reference</option>
                        <option>Cold Call</option>
                        <option>Walking</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Next Follow-up</label>
                      <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-xs" value={form.nextFollowUpDate} onChange={e => setForm({...form, nextFollowUpDate: e.target.value})} />
                   </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 uppercase text-slate-400 font-black text-[10px] tracking-widest hover:text-rose-500 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl uppercase text-[10px] font-black tracking-widest shadow-xl active:scale-95 transition-all hover:bg-indigo-600">
                    Capture Lead & Sync
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}