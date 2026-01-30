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
    <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-8 md:p-12">
          {/* Icon Header */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner rotate-3">
                <FiTarget size={40} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 text-white rounded-2xl flex items-center justify-center shadow-lg -rotate-12 border-4 border-white">
                <FiZap size={18} fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Good Morning! 
              <span className="block text-indigo-600 italic font-black">What's the plan today?</span>
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pb-4">
              Set your focus to unlock your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
            <div className="relative group">
              <div className="absolute top-4 left-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <FiEdit3 size={20} />
              </div>
              <textarea
                className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[2rem] outline-none text-sm font-bold text-slate-700 h-44 resize-none transition-all placeholder:text-slate-300 shadow-inner"
                placeholder="Ex: 1. Follow up with 5 new leads&#10;2. Finish the digital gold module&#10;3. Complete pending payment logs..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200 hover:shadow-indigo-200 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Setting Goals...</span>
              ) : (
                <>
                  Start My Work Day
                  <FiZap className="group-hover:animate-bounce" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
            Action is the foundational key to all success
          </p>
        </div>
      </div>
    </div>
  );
}