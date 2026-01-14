import { useState } from "react";
import { applyLeave } from "../services/leaveService";
import { Calendar, FileText, Send, Briefcase, Home, Clock } from "lucide-react";

export default function ApplyLeave() {
  const [form, setForm] = useState({
    type: "leave",
    reason: "",
    fromDate: "",
    toDate: ""
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.reason || !form.fromDate || !form.toDate) {
      alert("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      await applyLeave(form);
      alert("✅ Request submitted successfully!");
      setForm({ type: "leave", reason: "", fromDate: "", toDate: "" });
    } catch (error) {
      alert("❌ Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const requestTypes = [
    { id: 'leave', label: 'Leave', icon: Briefcase, color: 'text-rose-600 bg-rose-100' },
    { id: 'wfh', label: 'WFH', icon: Home, color: 'text-blue-600 bg-blue-100' },
    { id: 'permission', label: 'Permission', icon: Clock, color: 'text-amber-600 bg-amber-100' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8 flex justify-center items-start">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            New Request
          </h2>
          <p className="text-slate-500 text-sm mt-1">Fill out the details below for approval.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Request Type Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">
              Request Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {requestTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = form.type === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setForm({ ...form, type: type.id })}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mb-2 ${type.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={form.fromDate}
                  onChange={e => setForm({ ...form, fromDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={form.toDate}
                  onChange={e => setForm({ ...form, toDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Reason / Description</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
              <textarea
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[120px]"
                placeholder="Briefly explain why you need this..."
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submit}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-lg transition-all active:scale-[0.98] shadow-lg ${
              loading 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={20} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}