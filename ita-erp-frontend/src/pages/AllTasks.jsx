import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  Plus, Search, User, Calendar, 
  ChevronRight, Filter as FilterIcon,
  RefreshCcw, Briefcase, Edit3,
  Clock, CheckCircle2, Circle,
  AlertCircle, Users, Layers,
  XCircle, RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";

export default function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [empFilter, setEmpFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
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

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const recurring = tasks.filter(t => t.isRecurring).length;
    
    return { total, completed, pending, recurring };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.workshopName?.toLowerCase().includes(search.toLowerCase()) ||
                            t.assignedTo?.some(u => u.name.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesEmployee = empFilter === "all" || t.assignedTo?.some(u => u._id === empFilter);
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [tasks, search, statusFilter, empFilter]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'pending':
        return <Clock size={14} className="text-amber-500" />;
      default:
        return <Circle size={14} className="text-slate-300" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200"
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && statusFilter !== 'completed';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-900">Loading Tasks</p>
<p className="text-[10px] text-slate-400 font-medium mt-1">Syncing command center...</p>      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header with Stats */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2rem] p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Task <span className="text-indigo-300">Ledger</span>
            </h1>
            <p className="text-indigo-200/70 text-xs font-medium mt-1 flex items-center gap-2">
              <Briefcase size={12} />
              Master Oversight Panel • {taskStats.total} Total Tasks
            </p>
          </div>

          <button 
            onClick={() => navigate("/tasks/create")} 
            className="bg-white text-slate-900 hover:bg-indigo-50 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={18} /> 
            <span>Assign Task</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 mb-1">
              <Layers size={14} />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{taskStats.total}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 mb-1">
              <CheckCircle2 size={14} />
              <span className="text-xs font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold">{taskStats.completed}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 mb-1">
              <Clock size={14} />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">{taskStats.pending}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-purple-300 mb-1">
              <RefreshCcw size={14} />
              <span className="text-xs font-medium">Recurring</span>
            </div>
            <p className="text-2xl font-bold">{taskStats.recurring}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by task, workshop, or member..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <FilterIcon size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Filter by:</span>
            </div>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer min-w-[100px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select 
              value={empFilter} 
              onChange={(e) => setEmpFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer min-w-[120px]"
            >
              <option value="all">All Members</option>
              {uniqueEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 ml-auto border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid" 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Layers size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "list" 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Users size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(statusFilter !== "all" || empFilter !== "all" || search) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-400">Active filters:</span>
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                Status: {statusFilter}
              </span>
            )}
            {empFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                Member: {uniqueEmployees.find(e => e.id === empFilter)?.name}
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                Search: "{search}"
              </span>
            )}
            <button 
              onClick={() => { setStatusFilter("all"); setEmpFilter("all"); setSearch(""); }}
              className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-auto"
            >
              <XCircle size={14} />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-600">
          Showing <span className="font-bold text-indigo-600">{filteredTasks.length}</span> of {tasks.length} tasks
        </p>
        <p className="text-xs text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Task Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map(task => {
            const overdue = isOverdue(task.dueDate);
            
            return (
              <div 
                key={task._id} 
                className="group bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/tasks/${task._id}`)}
              >
                {/* Status Header Bar */}
                <div className={`h-1.5 w-full ${task.status === 'completed' ? 'bg-emerald-500' : overdue ? 'bg-rose-500' : 'bg-amber-400'}`} />
                
                <div className="p-5">
                  {/* Top Row: Status & Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                      {task.isRecurring && (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full text-[8px] font-bold flex items-center gap-1">
                          <RefreshCcw size={10} />
                          {task.frequency}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/tasks/edit/${task._id}`); }}
                      className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>

                  {/* Workshop */}
                  {task.workshopName && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500">
                      <Briefcase size={12} className="text-indigo-400" />
                      <span className="font-medium">{task.workshopName}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`text-base font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors ${
                    task.status === 'completed' ? 'line-through text-slate-400' : ''
                  }`}>
                    {task.title}
                  </h3>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    {/* Assignees */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <User size={14} className="text-indigo-400" />
                      <span className="font-medium truncate max-w-[100px]">
                        {task.assignedTo?.[0]?.name || "Unassigned"}
                        {task.assignedTo?.length > 1 && ` +${task.assignedTo.length - 1}`}
                      </span>
                    </div>

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className={`flex items-center gap-1.5 text-xs ${
                        overdue ? 'text-rose-500 font-bold' : 'text-slate-500'
                      }`}>
                        <Calendar size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {filteredTasks.map(task => {
            const overdue = isOverdue(task.dueDate);
            
            return (
              <div 
                key={task._id}
                className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/tasks/${task._id}`)}
              >
                {/* Status Indicator */}
                <div className={`w-1 h-8 rounded-full ${
                  task.status === 'completed' ? 'bg-emerald-500' : 
                  overdue ? 'bg-rose-500' : 'bg-amber-400'
                }`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 ${
                      task.status === 'completed' ? 'line-through text-slate-400' : ''
                    }`}>
                      {task.title}
                    </h4>
                    {task.isRecurring && (
                      <span className="text-[8px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <RefreshCcw size={8} />
                        {task.frequency}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {task.workshopName && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={10} />
                        {task.workshopName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User size={10} />
                      {task.assignedTo?.[0]?.name || "Unassigned"}
                      {task.assignedTo?.length > 1 && ` +${task.assignedTo.length - 1}`}
                    </span>
                  </div>
                </div>

                {/* Status & Date */}
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                  
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 text-xs ${
                      overdue ? 'text-rose-500 font-bold' : 'text-slate-400'
                    }`}>
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}

                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No tasks found</h3>
          <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or create a new task</p>
          <button 
            onClick={() => navigate("/tasks/create")}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
          >
            <Plus size={16} />
            Create New Task
          </button>
        </div>
      )}
    </div>
  );
}