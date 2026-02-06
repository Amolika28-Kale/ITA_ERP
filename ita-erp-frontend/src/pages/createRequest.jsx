import { useState } from "react";
import { createRequest } from "../services/requestService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react"; // Added icons for better mobile UX

export default function CreateRequest({ form: extForm, setForm: extSetForm, onSubmit, isEdit = false }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [localForm, setLocalForm] = useState({
    title: "",
    description: "",
    requestType: "Other",
    priority: "Medium",
    fromDate: "",
    toDate: "",
  });

  const form = extForm ?? localForm;
  const setForm = extSetForm ?? setLocalForm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await onSubmit();
      } else {
        await createRequest(form);
        toast.success("Request submitted successfully ✅");
      }
      navigate("/my-requests");
    } catch (error) {
      toast.error("Operation failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // Responsive Styles
  const inputStyle = "w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 outline-none transition-all text-sm md:text-base";
  const labelStyle = "block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-12 font-sans flex justify-center">
      <div className="w-full max-w-xl self-start">
        
        {/* Mobile-Friendly Back Button */}
        <button 
          onClick={() => navigate("/my-requests")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Queue</span>
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
          <div className="bg-blue-600 h-2 w-full" />
          
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
            <header>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight italic">
                {isEdit ? "Update" : "Create"} <span className="text-blue-600">Request</span>
              </h2>
              <p className="text-gray-400 text-xs mt-1 font-medium italic">Internal Enterprise Audit Trail</p>
            </header>
            
            <div className="space-y-5">
              {/* REQUEST TYPE */}
              <div>
                <label className={labelStyle}>Request Category</label>
                <select className={inputStyle} value={form.requestType} onChange={(e) => setForm({ ...form, requestType: e.target.value })}>
                  {["Leave", "Permission", "Asset", "Support", "Approval", "Complaint", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* DATE RANGE - Stacked on very small mobile, grid on larger mobile */}
              {(form.requestType === "Leave" || form.requestType === "Permission") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className={labelStyle}>Start Date</label>
                    <input 
                      type="date" 
                      className={inputStyle} 
                      value={form.fromDate ? new Date(form.fromDate).toISOString().split('T')[0] : ""} 
                      onChange={(e) => setForm({ ...form, fromDate: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>End Date</label>
                    <input 
                      type="date" 
                      className={inputStyle} 
                      value={form.toDate ? new Date(form.toDate).toISOString().split('T')[0] : ""} 
                      onChange={(e) => setForm({ ...form, toDate: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
              )}

              {/* TITLE */}
              <div>
                <label className={labelStyle}>Subject / Title</label>
                <input 
                  className={inputStyle} 
                  placeholder="e.g. Annual Sick Leave" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className={labelStyle}>Detailed Reason</label>
                <textarea 
                  className={`${inputStyle} min-h-[120px] resize-none leading-relaxed`} 
                  placeholder="Provide context for the admin team..." 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  required 
                />
              </div>

              {/* PRIORITY */}
              <div>
                <label className={labelStyle}>Urgency Level</label>
                <div className="flex flex-wrap gap-2">
                  {["Low", "Medium", "High"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        form.priority === p 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BUTTON GROUP - Vertical on small mobile, Horizontal on tablet */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => navigate("/my-requests")}
                className="order-2 sm:order-1 flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={submitting} 
                className={`order-1 sm:order-2 flex-[2] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                  submitting 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-slate-900 active:scale-95 shadow-blue-200"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    {isEdit ? "Update Ledger" : "Transmit Request"}
                    {isEdit ? <CheckCircle size={16}/> : <Send size={16} />}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}