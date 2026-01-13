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
    { id: 'leave', label: 'Leave', icon: Briefcase, color: 'text-rose-500 bg-rose-50' },
    { id: 'wfh', label: 'WFH', icon: Home, color: 'text-blue-500 bg-blue-50' },
    { id: 'permission', label: 'Permission', icon: Clock, color: 'text-amber-500 bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 flex justify-center items-start">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            New Request
          </h2>
          <p className="text-slate-500 text-sm">Fill out the details below for approval.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Request Type Selector - Visual Cards */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">
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
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mb-2 ${type.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={form.fromDate}
                  onChange={e => setForm({ ...form, fromDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={form.toDate}
                  onChange={e => setForm({ ...form, toDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Reason / Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-4 text-slate-400" size={16} />
              <textarea
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px]"
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
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold transition-all active:scale-[0.98] shadow-lg ${
              loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}