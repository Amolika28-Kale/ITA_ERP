import { useState, useEffect } from "react";
import { submitManualReport } from "../services/staffreportService";
import { FiClock, FiSend, FiCheckCircle } from "react-icons/fi";
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
    if (hoursSinceLogin < 3) return "0-3 Hours (Initial Slot)";
    if (hoursSinceLogin < 6) return "3-6 Hours (Mid-Day Slot)";
    if (hoursSinceLogin < 9) return "6-9 Hours (Evening Slot)";
    return "Overtime Slot";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Report content cannot be empty");

    setLoading(true);
    try {
      await submitManualReport({ reportText: text, intervalSlot: getSlotLabel() });
      toast.success("Work report submitted successfully!");
      setText(""); // Reset after submission
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in">
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Session Window</p>
        <h2 className="text-3xl font-black italic mt-1 flex items-center gap-3">
          <FiClock /> {getSlotLabel()}
        </h2>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tight">Log Your Progress</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-5 bg-slate-50 border-none rounded-3xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
            placeholder="Write everything you handled in the last 3 hours (e.g., calls, leads updated, payments collected)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className="w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
          >
            {loading ? "Syncing..." : <><FiSend /> Submit 3-Hour Report</>}
          </button>
        </form>
      </div>
    </div>
  );
}