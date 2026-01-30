import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchMyTasks, toggleTaskStatus } from "../services/taskService";
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Search, 
  Calendar,
  AlertCircle,
  Inbox
} from "lucide-react";
import toast from "react-hot-toast";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchMyTasks();
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to load your tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (e, id, currentStatus) => {
    e.preventDefault(); // Prevent navigating to details when clicking checkbox
    try {
      await toggleTaskStatus(id);
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      toast.success(newStatus === "completed" ? "Task Completed! 🎉" : "Task moved to Pending");
      
      // Local state update for instant feedback
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-8 space-y-4 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* --- MINIMALIST HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Work Queue</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
            {tasks.filter(t => t.status === "pending").length} Tasks Remaining
          </p>
        </div>

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">Empty Queue</h3>
            <p className="text-slate-400 text-sm">You're all caught up for now!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <Link
              key={task._id}
              to={`/tasks/${task._id}`}
              className={`group flex items-center justify-between p-5 bg-white border-2 rounded-[1.5rem] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 
                ${task.status === 'completed' ? 'border-emerald-50 opacity-70' : 'border-slate-50 hover:border-indigo-100'}`}
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                {/* CHECKBOX ACTION */}
                <button 
                  onClick={(e) => handleToggle(e, task._id, task.status)}
                  className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all active:scale-90
                    ${task.status === 'completed' 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-200 bg-white text-slate-300 hover:border-indigo-400 hover:text-indigo-400'}`}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>

                <div className="min-w-0">
                  <h3 className={`font-bold text-slate-800 group-hover:text-indigo-600 transition-all truncate text-base
                    ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border 
                      ${task.priority === 'urgent' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <div className="h-10 w-10 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all">
                  <ChevronRight size={24} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest pt-10">
        Syncing with Master Admin Ledger
      </p>
    </div>
  );
}