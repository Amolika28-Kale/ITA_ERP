import { useEffect, useState } from "react";
import { getInquiries, createInquiry, updateInquiry } from "../services/inquiryService";
import { toast } from "react-hot-toast";
import { 
  FiPlus, FiPhone, FiCalendar, FiSearch, 
  FiEdit, FiX, FiActivity, FiAlertCircle 
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

  const [form, setForm] = useState({ clientName: "", phone: "", requirement: "", source: "Cold Call", nextFollowUpDate: "" });
  const [updateData, setUpdateData] = useState({ status: "", adminRemark: "", nextFollowUpDate: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInquiries();
      setList(res.data);
      setFiltered(res.data);
    } catch (err) { toast.error("Load failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const res = list.filter(i => 
      i.clientName.toLowerCase().includes(search.toLowerCase()) || i.phone.includes(search)
    );
    setFiltered(res);
  }, [search, list]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateData.adminRemark) return toast.error("Please add a follow-up remark");
    try {
      await updateInquiry(selectedInquiry._id, updateData);
      toast.success("Follow-up logged! ✅");
      setShowEditModal(false);
      loadData();
    } catch (err) { toast.error("Update failed"); }
  };

  const getStatusColor = (s) => {
    const colors = { Converted: "bg-emerald-50 text-emerald-700", Lost: "bg-rose-50 text-rose-700", "Follow-up": "bg-amber-50 text-amber-700" };
    return colors[s] || "bg-blue-50 text-blue-700";
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300">LOADING ENGINE...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in">
      {/* Summary Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 italic">Lead <span className="text-indigo-600">Engine</span></h2>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-3 py-1 rounded-lg">
              {list.filter(i => i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate))).length} Today's Follow-ups
            </span>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl active:scale-95 flex items-center gap-2">
          <FiPlus size={20}/> Capture Lead
        </button>
      </header>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(i => (
          <div key={i._id} className={`bg-white border rounded-[2rem] p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-xl ${i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate)) ? 'ring-2 ring-amber-500' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(i.status)}`}>{i.status}</span>
              {i.nextFollowUpDate && isToday(new Date(i.nextFollowUpDate)) && <FiAlertCircle className="text-amber-500 animate-pulse" size={20}/>}
            </div>

            <h3 className="text-xl font-black text-slate-800 leading-tight">{i.clientName}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase mt-1 mb-4 flex items-center gap-1"><FiPhone/> {i.phone}</p>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-2">
               <p className="text-xs text-slate-600 font-medium italic">"{i.requirement}"</p>
               <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Action</span>
                  <span className="text-[10px] font-bold text-amber-600">{i.nextFollowUpDate ? format(new Date(i.nextFollowUpDate), "dd MMM") : "TBD"}</span>
               </div>
            </div>

            <button 
              onClick={() => { setSelectedInquiry(i); setUpdateData({status: i.status, nextFollowUpDate: i.nextFollowUpDate?.split('T')[0]}); setShowEditModal(true); }}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all"
            >
              <FiActivity/> Log Activity
            </button>
          </div>
        ))}
      </div>

      {/* --- MODAL: LOG ACTIVITY & UPDATE --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 italic">Log <span className="text-indigo-600">Activity</span></h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedInquiry?.clientName}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-slate-300 hover:text-slate-900"><FiX size={24}/></button>
             </div>
             
             <form onSubmit={handleUpdate} className="space-y-4">
                <div className="max-h-40 overflow-y-auto bg-slate-50 p-4 rounded-xl text-[11px] text-slate-500 whitespace-pre-wrap mb-4 border border-dashed">
                   <p className="font-black text-slate-400 mb-2 uppercase">Previous Logs:</p>
                   {selectedInquiry?.adminRemark || "No previous history found."}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">New Status</label>
                      <select className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-xs" value={updateData.status} onChange={e => setUpdateData({...updateData, status: e.target.value})}>
                         {["New", "Follow-up", "Quotation Sent", "Converted", "Lost"].map(s => <option key={s}>{s}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Next Follow-up</label>
                      <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-xs" value={updateData.nextFollowUpDate} onChange={e => setUpdateData({...updateData, nextFollowUpDate: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Follow-up Remark (Today's Call)</label>
                   <textarea className="w-full p-4 rounded-xl bg-slate-50 border-none resize-none text-sm font-medium" rows="3" placeholder="Enter call details..." required onChange={e => setUpdateData({...updateData, adminRemark: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                  Submit Log & Update Status
                </button>
             </form>
          </div>
        </div>
      )}

    
      {/* MODAL: ADD LEAD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
             <h2 className="text-2xl font-black text-slate-900 mb-6 italic">Capture <span className="text-indigo-600">New Lead</span></h2>
             <form onSubmit={handleAddSubmit} className="space-y-4">
                <input type="text" placeholder="Client Name" className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500" required value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} />
                <input type="text" placeholder="Phone Number" className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <textarea placeholder="Requirement Details..." className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 resize-none" rows="3" required value={form.requirement} onChange={e => setForm({...form, requirement: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <select className="p-4 rounded-xl bg-slate-50 border-none" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                      <option>Google</option><option>Facebook</option><option>Reference</option><option>Cold Call</option>
                   </select>
                   <input type="date" className="p-4 rounded-xl bg-slate-50 border-none" value={form.nextFollowUpDate} onChange={e => setForm({...form, nextFollowUpDate: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 uppercase text-slate-400 font-black text-[10px]">Close</button>
                  <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl uppercase text-[10px] font-black tracking-widest">Capture Lead</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}