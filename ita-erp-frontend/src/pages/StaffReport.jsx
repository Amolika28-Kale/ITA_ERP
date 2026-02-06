import { useState, useEffect } from "react";
import { submitManualReport } from "../services/staffreportService";
import { FiClock, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";

export default function StaffReport() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoursSinceLogin, setHoursSinceLogin] = useState(0);

  useEffect(() => {
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime) {
      const diff = Math.floor((new Date() - new Date(loginTime)) / (1000 * 60 * 60));
      setHoursSinceLogin(diff);
    }
  }, []);

  const getSlotLabel = () => {
    if (hoursSinceLogin < 3) return "0-3 Hours (Initial)";
    if (hoursSinceLogin < 6) return "3-6 Hours (Mid-Day)";
    if (hoursSinceLogin < 9) return "6-9 Hours (Evening)";
    return "Overtime Slot";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Report content cannot be empty");

    setLoading(true);
    try {
      await submitManualReport({ reportText: text, intervalSlot: getSlotLabel() });
      toast.success("Work report submitted successfully!");
      setText(""); 
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // P-4 on mobile, P-6 on desktop
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 animate-in fade-in duration-500">
      
      {/* Session Header - Dynamic padding and text size */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />
        
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 relative z-10">
          Current Session Window
        </p>
        <h2 className="text-xl md:text-3xl font-black italic mt-1 flex items-center gap-2 md:gap-3 relative z-10">
          <FiClock className="shrink-0 text-indigo-500" /> {getSlotLabel()}
        </h2>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight">
                Log Your Progress
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                Audit Trail ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl md:rounded-3xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 min-h-[180px] md:min-h-[200px] outline-none transition-all"
            placeholder="Describe your handled tasks (calls, leads, payments)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          
          <button
            disabled={loading}
            className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Syncing...
                </span>
            ) : (
                <><FiSend size={16} /> Submit {hoursSinceLogin < 9 ? '3-Hour' : ''} Report</>
            )}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="text-center">
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
            End-to-End Encrypted ERP Reporting
         </p>
      </div>
    </div>
  );
}