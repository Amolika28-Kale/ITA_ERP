import { useState } from "react";
import { FiCheckCircle, FiAward, FiActivity } from "react-icons/fi";
import toast from "react-hot-toast";
import { submitAchievement } from "../services/selfTaskService";

export default function AchievementModal({ onSuccess, onCancel }) {
  const [achievement, setAchievement] = useState("");
  const [loading, setLoading] = useState(false);

// ... inside AchievementModal component
const handleSubmit = async (e) => {
  e.preventDefault();
  if (achievement.trim().length < 10) {
    return toast.error("Please provide at least 10 characters for your recap.");
  }

  try {
    setLoading(true);
    
    // achievement here is the string from your useState
    // our updated service will convert it to { achievements: "..." }
    await submitAchievement(achievement); 
    
    toast.success("Workday completed! 👋");
    onSuccess(); 
  } catch (err) {
    // Check if the plan was missing (404 from backend)
    const msg = err.response?.data?.message || "Failed to submit. Please try again.";
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-indigo-600" />
        <div className="p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
              <FiAward size={40} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">Day <span className="text-emerald-600 italic">Recap!</span></h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">What did you achieve today?</p>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-left">
            <div className="relative group">
              <textarea
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-[2rem] outline-none text-sm font-bold text-slate-700 h-44 resize-none transition-all"
                placeholder="List your key results for the day..."
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Cancel</button>
              <button type="submit" disabled={loading} className="flex-[2] bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all">
                {loading ? "Saving..." : <><FiCheckCircle /> Complete & Logout</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}