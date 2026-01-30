import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  Plus, Search, User, Calendar, 
  ChevronRight, Filter as FilterIcon 
} from "lucide-react";
import toast from "react-hot-toast";

export default function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [empFilter, setEmpFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks/all");
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to load master task list");
    } finally {
      setLoading(false);
    }
  };

  const uniqueEmployees = useMemo(() => {
    const map = new Map();
    tasks.forEach(t => {
      t.assignedTo?.forEach(u => { if (u._id) map.set(u._id, u.name); });
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.assignedTo?.some(u => u.name.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesEmployee = empFilter === "all" || t.assignedTo?.some(u => u._id === empFilter);
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [tasks, search, statusFilter, empFilter]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
        Synchronizing Ledger...
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter ">
            Task <span className="text-indigo-600">Board</span>
          </h1>
          <p className="text-slate-400 font-bold text-[8px] uppercase tracking-[0.2em]">Command Center</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} />
            <input 
              type="text" placeholder="Search..."
              className="w-full sm:w-60 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate("/tasks/create")} 
            className="bg-indigo-600 hover:bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all shrink-0"
          >
            <Plus size={14} /> Assign Task
          </button>
        </div>
      </div>

      {/* --- COMPACT FILTERS --- */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400 mr-1">
          <FilterIcon size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Filter:</span>
        </div>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase text-slate-600 outline-none focus:ring-2 focus:ring-indigo-50"
        >
          <option value="all">Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <select 
          value={empFilter} 
          onChange={(e) => setEmpFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase text-slate-600 outline-none focus:ring-2 focus:ring-indigo-50 max-w-[120px]"
        >
          <option value="all">Members</option>
          {uniqueEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        {(statusFilter !== "all" || empFilter !== "all" || search) && (
          <button 
            onClick={() => { setStatusFilter("all"); setEmpFilter("all"); setSearch(""); }}
            className="text-[9px] font-black text-rose-500 uppercase hover:underline ml-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* --- RESPONSIVE GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTasks.map(task => (
          <div 
            key={task._id} 
            // onClick={() => navigate(`/tasks/${task._id}`)}
            className="group cursor-pointer bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 h-full w-1 ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border 
                ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {task.status}
              </span>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>

            <h3 className={`text-sm font-bold text-slate-800 leading-snug mb-3 line-clamp-2 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h3>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                <User size={12} className="shrink-0" />
                <span className="truncate max-w-[80px]">
                  {task.assignedTo?.length > 0 ? task.assignedTo[0].name : "N/A"}
                  {task.assignedTo?.length > 1 && ` +${task.assignedTo.length - 1}`}
                </span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase ml-auto">
                  <Calendar size={12} className="shrink-0" />
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">No results found.</p>
        </div>
      )}
    </div>
  );
}