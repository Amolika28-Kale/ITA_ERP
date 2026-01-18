import { useEffect, useState } from "react";
import { fetchMyTasks, markCompleted } from "../services/taskService";
import { CheckCircle2, Circle, Clock, CalendarDays, Trophy, ListTodo } from "lucide-react";

export default function AdminMyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await fetchMyTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const toggleComplete = async (task) => {
    if (task.status === "completed") return;
    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: "completed" } : t));
    try {
      await markCompleted(task._id);
    } catch (err) {
      loadTasks(); // Revert on error
    }
  };

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* --- STATS CARD --- */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-1">My Daily Tasks</h2>
            <p className="text-indigo-100 text-sm font-medium">You've completed {completedCount} of {tasks.length} tasks</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Trophy className="text-yellow-300" size={24} />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <div className="bg-white rounded-[2rem] p-2 md:p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6 px-4 pt-4 md:pt-0">
          <ListTodo className="text-indigo-600" size={20} />
          <h3 className="font-bold text-slate-800 tracking-tight">Focus List</h3>
        </div>

        {loading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium">No tasks assigned to you yet.</p>
              </div>
            ) : (
              tasks.map(task => {
                const isCompleted = task.status === "completed";
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

                return (
                  <div
                    key={task._id}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 
                      ${isCompleted ? 'bg-slate-50 border-transparent opacity-75' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}
                  >
                    {/* Circle Checkbox */}
                    <button 
                      onClick={() => toggleComplete(task)}
                      className="flex-shrink-0 transition-transform active:scale-90"
                    >
                      {isCompleted ? (
                        <div className="bg-emerald-500 rounded-full p-1 shadow-sm shadow-emerald-200">
                          <CheckCircle2 className="text-white" size={20} />
                        </div>
                      ) : (
                        <Circle className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={28} />
                      )}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm md:text-base truncate transition-all
                        ${isCompleted ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-tight
                          ${isOverdue ? "text-rose-500" : "text-slate-400"}`}>
                          <CalendarDays size={12} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Flexible"}
                        </div>
                        
                        {task.priority && (
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md
                            ${task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side status icon for desktop */}
                    {!isCompleted && isOverdue && (
                      <div className="hidden md:flex items-center gap-1 text-rose-500 font-bold text-[10px] uppercase">
                        <Clock size={12} /> Overdue
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}