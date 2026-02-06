import { useState } from "react";
import { FiCheckCircle, FiAward } from "react-icons/fi";
import toast from "react-hot-toast";
import { submitAchievement } from "../services/selfTaskService";

export default function AchievementModal({ onSuccess, onCancel }) {
  const [achievement, setAchievement] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (achievement.trim().length < 10) {
      return toast.error("Please provide at least 10 characters for your recap.");
    }

    try {
      setLoading(true);
      await submitAchievement(achievement); 
      toast.success("Workday completed! 👋");
      onSuccess(); 
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Container: Max width on mobile, max-lg on desktop */}
      <div className="bg-white w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
        
        {/* Accent Bar */}
        <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-emerald-400 to-indigo-600" />
        
        <div className="p-6 sm:p-12 text-center">
          {/* Award Icon - Scaled for mobile */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] sm:rounded-3xl flex items-center justify-center shadow-inner">
              <FiAward className="size-8 sm:size-10" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Day <span className="text-emerald-600 italic">Recap!</span>
          </h2>
          <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-2">
            What did you achieve today?
          </p>
          
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 text-left">
            <div className="relative group">
              <textarea
                // Responsive height: h-32 on small mobile, h-44 on larger screens
                className="w-full p-5 sm:p-6 bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-[1.5rem] sm:rounded-[2rem] outline-none text-sm font-bold text-slate-700 h-32 sm:h-44 resize-none transition-all placeholder:text-slate-300 shadow-inner"
                placeholder="List your key results for the day..."
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                required
              />
            </div>

            {/* Actions: Grid layout to ensure buttons remain side-by-side or stack neatly */}
            <div className="flex flex-row gap-2 sm:gap-3">
              <button 
                type="button" 
                onClick={onCancel} 
                className="flex-1 py-3.5 sm:py-4 text-[10px] sm:text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-[2] bg-slate-900 hover:bg-emerald-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheckCircle className="size-4" /> 
                    <span className="truncate">Finish & Logout</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center mt-5 sm:mt-6 text-[9px] sm:text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
            Great work today! Syncing your results to the ERP...
          </p>
        </div>
      </div>
    </div>
  );
}