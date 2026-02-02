import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchMyTasks, toggleTaskStatus } from "../services/taskService";
import { 
  CheckCircle2, Circle, ChevronRight, Search, 
  Calendar, Inbox, Filter, Plus, User, UserCheck, Briefcase 
} from "lucide-react";
import toast from "react-hot-toast";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { loadData(); }, []);

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
    e.preventDefault();
    try {
      await toggleTaskStatus(id);
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      toast.success(newStatus === "completed" ? "Task Completed! 🎉" : "Task moved to Pending");
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return tasks.filter(t => {
      const taskDate = t.dueDate ? new Date(t.dueDate) : null;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.workshopName?.toLowerCase().includes(search.toLowerCase());
      
      const isSelfTask = t.createdBy === user.id || t.createdBy?._id === user.id;
      let matchesAssignment = true;
      if (assignmentFilter === "self") matchesAssignment = isSelfTask;
      if (assignmentFilter === "assigned") matchesAssignment = !isSelfTask;

      let matchesTime = true;
      if (taskDate) {
        const taskTime = new Date(taskDate).setHours(0, 0, 0, 0);
        if (timeFilter === "today") matchesTime = taskTime === startOfToday.getTime();
        else if (timeFilter === "week") matchesTime = taskTime >= startOfWeek.getTime();
        else if (timeFilter === "month") matchesTime = taskTime >= startOfMonth.getTime();
      } else if (timeFilter !== "all") {
        matchesTime = false;
      }

      return matchesSearch && matchesTime && matchesAssignment;
    });
  }, [tasks, search, timeFilter, assignmentFilter, user.id]);

  if (loading) return (
    <div className="max-w-6xl mx-auto p-8 space-y-4 animate-pulse">
      <div className="h-20 bg-slate-100 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic hidden sm:block">
          Work <span className="text-indigo-600">Queue</span>
        </h1>

        {/* --- CONSOLIDATED COMMAND BAR --- */}
        <div className="flex flex-1 items-center bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm gap-2 overflow-x-auto scrollbar-hide">
          
          <div className="relative group flex-1 min-w-[140px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              type="text" placeholder="Search Workshop or Title..."
              className="w-full pl-8 pr-2 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
            <select 
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="bg-slate-50 text-[9px] font-black uppercase px-3 py-2 rounded-lg outline-none border-none cursor-pointer text-slate-600"
            >
              <option value="all">All Sources</option>
              <option value="assigned">From Admin</option>
              <option value="self">My Private</option>
            </select>
          </div>

          <div className="hidden xl:flex items-center gap-1 border-l border-slate-100 pl-2">
            {["all", "today", "week", "month"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                  ${timeFilter === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            to="/tasks/create-self"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 flex items-center gap-2 shrink-0 transition-all"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Add Task</span>
          </Link>
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <Inbox size={40} className="mx-auto text-slate-200 mb-2" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching tasks</h3>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isSelfTask = task.createdBy === user.id || task.createdBy?._id === user.id;
            return (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className={`group flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl transition-all hover:shadow-lg hover:shadow-indigo-500/5 
                  ${task.status === 'completed' ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button 
                    onClick={(e) => handleToggle(e, task._id, task.status)}
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all
                      ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-100 bg-white text-slate-200 hover:border-indigo-600'}`}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </button>

                  <div className="min-w-0">
                    <h3 className={`font-bold text-slate-800 text-sm truncate ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* ✅ Workshop Name Tag */}
                      <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                        <Briefcase size={10} />
                        {task.workshopName || "General"}
                      </span>

                      {/* Source Indicator */}
                      <span className={`flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border 
                        ${isSelfTask ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                        {isSelfTask ? <User size={10} /> : <UserCheck size={10} />}
                        {isSelfTask ? 'Self' : 'Admin'}
                      </span>

                      {task.dueDate && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">/ {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-600" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}