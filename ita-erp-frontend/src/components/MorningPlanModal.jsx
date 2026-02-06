import { useState } from "react";
import { FiTarget, FiZap, FiEdit3 } from "react-icons/fi";
import toast from "react-hot-toast";
import { submitPlan } from "../services/selfTaskService";

export default function MorningPlanModal({ onSuccess }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      return toast.error("Please describe your goals with at least 10 characters.");
    }

    setLoading(true);
    try {
      await submitPlan({ plannedTasks: text });
      toast.success("Goal locked in! Have a productive day 🚀");
      onSuccess();
    } catch (err) {
      toast.error("Failed to save plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // P-4 on mobile to prevent touching edges, backdrop-blur for focus
    <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
        
        {/* Top Accent Bar */}
        <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-6 sm:p-12">
          {/* Icon Header - Scaled down for mobile */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] sm:rounded-3xl flex items-center justify-center shadow-inner rotate-3 transition-transform">
                <FiTarget className="size-8 sm:size-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-amber-400 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg -rotate-12 border-2 sm:border-4 border-white">
                <FiZap className="size-4 sm:size-[18px]" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Good Morning! 
              <span className="block text-indigo-600 italic font-black">Today's plan?</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-2 sm:pb-4">
              Unlock your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-2 sm:mt-4 space-y-4 sm:space-y-6">
            <div className="relative group">
              <div className="absolute top-4 left-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <FiEdit3 size={18} className="sm:size-[20px]" />
              </div>
              <textarea
                // Adjusted height for mobile (h-32 vs h-44)
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-4 sm:py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] sm:rounded-[2rem] outline-none text-xs sm:text-sm font-bold text-slate-700 h-32 sm:h-44 resize-none transition-all placeholder:text-slate-300 shadow-inner"
                placeholder="Ex: 1. Follow up with leads&#10;2. Finish training module..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-pulse">Locking in...</span>
              ) : (
                <>
                  Start Work Day
                  <FiZap className="group-hover:animate-bounce shrink-0" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-5 sm:mt-6 text-[9px] sm:text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
            Action is the foundational key to success
          </p>
        </div>
      </div>
    </div>
  );
}