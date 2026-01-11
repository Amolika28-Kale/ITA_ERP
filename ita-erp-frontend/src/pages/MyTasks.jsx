import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { 
  CheckCircle2, 
  Clock, 
  Folder, 
  ChevronRight, 
  Filter,
  Calendar,
  AlertCircle
} from "lucide-react";

const STATUS_THEMES = {
  todo: "bg-slate-100 text-slate-600 border-slate-200",
  "in-progress": "bg-indigo-50 text-indigo-600 border-indigo-100",
  review: "bg-amber-50 text-amber-600 border-amber-100",
  completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/tasks/my")
      .then(res => {
        setTasks(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4 animate-pulse px-6">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 font-medium">You have <span className="text-indigo-600 font-bold">{tasks.filter(t => t.status !== 'completed').length} pending</span> items to handle.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded-xl flex items-center gap-2">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
            <p className="text-slate-400">No pending tasks assigned to you.</p>
          </div>
        ) : (
          tasks.map(task => (
            <Link
              key={task._id}
              to={`/tasks/${task._id}`}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
            >
              {/* Left Side: Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className={`mt-1 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                  {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate text-lg">
                    {task.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Project Tag */}
                    {task.project && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-wider">
                        <Folder size={12} />
                        {task.project.name}
                      </span>
                    )}
                    
                    {/* Due Date */}
                    {task.dueDate && (
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${new Date(task.dueDate) < new Date() ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {new Date(task.dueDate) < new Date() ? <AlertCircle size={12} /> : <Calendar size={12} />}
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Status & Action */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${STATUS_THEMES[task.status] || STATUS_THEMES.todo}`}>
                  {task.status.replace("-", " ")}
                </span>
                
                <div className="p-2 bg-slate-50 text-slate-300 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}