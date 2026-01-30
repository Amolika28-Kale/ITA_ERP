import { useState } from "react";
import { createRequest } from "../services/requestService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

  const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none transition-all";
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="flex justify-center bg-gray-50 p-6 min-h-screen font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl self-start overflow-hidden">
        <div className="bg-blue-600 h-2" />
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            {isEdit ? "Edit Request" : "New Request"}
          </h2>
          
          <div>
            <label className={labelStyle}>Request Type</label>
            <select className={inputStyle} value={form.requestType} onChange={(e) => setForm({ ...form, requestType: e.target.value })}>
              {["Leave", "Permission", "Asset", "Support", "Approval", "Complaint", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {(form.requestType === "Leave" || form.requestType === "Permission") && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className={labelStyle}>From Date</label>
                <input 
                  type="date" 
                  className={inputStyle} 
                  value={form.fromDate ? new Date(form.fromDate).toISOString().split('T')[0] : ""} 
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className={labelStyle}>To Date</label>
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

          <div>
            <label className={labelStyle}>Title</label>
            <input className={inputStyle} placeholder="Short summary" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label className={labelStyle}>Description</label>
            <textarea className={`${inputStyle} min-h-[100px] resize-none`} placeholder="Provide more details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>

          <div>
            <label className={labelStyle}>Priority</label>
            <select className={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Button Group */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => navigate("/my-requests")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all active:scale-95"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              disabled={submitting} 
              className={`flex-[2] text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-100"}`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                isEdit ? "Update Request" : "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}