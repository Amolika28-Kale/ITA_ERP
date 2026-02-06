import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSelfTask } from "../services/taskService";
import { 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Flag, 
  Calendar, 
  AlignLeft, 
  Type 
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreateSelfTask() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createSelfTask(form);
      toast.success("Task added to your list 🚀");
      navigate("/my-task");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Responsive padding: p-4 for mobile, p-10 for desktop
    <div className="max-w-2xl mx-auto p-4 md:p-10 animate-in fade-in zoom-in-95 duration-500">
      
      {/* --- TOP HEADER NAVIGATION --- */}
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <button 
          onClick={() => navigate("/my-task")} 
          className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Queue</span>
          <span className="sm:hidden text-[9px]">Back</span>
        </button>

        <button 
          onClick={() => navigate("/my-task")}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* --- MAIN FORM CARD --- */}
      {/* Reduced rounded corners slightly for mobile (rounded-3xl vs rounded-[3rem]) */}
      <div className="bg-white border-2 border-slate-50 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-indigo-500/5 overflow-hidden relative">
        <div className="h-2 w-full bg-indigo-600" />
        
        <form onSubmit={submit} className="p-6 md:p-12 space-y-6 md:space-y-10">
          
          <div className="space-y-2">
            {/* Font size adjustment: text-2xl for mobile, text-3xl for desktop */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">
              New <span className="text-indigo-600">Personal Task</span>
            </h1>
            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Assign work to yourself</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            
            {/* TASK TITLE */}
            <div className="space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type size={14} /> Task Title
              </label>
              <input
                required
                placeholder="What needs to be done?"
                // Smaller padding on mobile, smaller text size
                className="w-full text-lg md:text-xl font-bold p-4 md:p-6 bg-slate-50 border-none rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* PRIORITY & DUE DATE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Flag size={14} /> Priority
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer appearance-none"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={14} /> Deadline
                </label>
                <input
                  type="date"
                  className="w-full p-4 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <AlignLeft size={14} /> Notes / Description
              </label>
              <textarea
                placeholder="Add more details..."
                className="w-full p-4 md:p-6 bg-slate-50 border-none rounded-2xl md:rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none resize-none"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* --- BUTTONS --- */}
          {/* Order-last on mobile for the cancel button, or stacked */}
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-6 border-t border-slate-50">
            <button 
              disabled={loading}
              className="w-full sm:flex-1 order-1 sm:order-2 bg-slate-900 hover:bg-indigo-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Add to Queue"}
              <CheckCircle2 size={18} />
            </button>

            <button 
              type="button"
              onClick={() => navigate("/my-task")}
              className="w-full sm:w-auto order-2 sm:order-1 px-8 py-4 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}