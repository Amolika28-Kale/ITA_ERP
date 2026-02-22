import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchMyTasks, toggleTaskStatus } from "../services/taskService";
import { 
  CheckCircle2, Circle, ChevronRight, Search, 
  Inbox, Plus, User, UserCheck, Briefcase, 
  Clock, Calendar, Tag, Filter, Grid3x3,
  List, LayoutGrid, X, Edit3, Trash2
} from "lucide-react";
import toast from "react-hot-toast";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, today, week, month
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);

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
    e.stopPropagation();
    try {
      await toggleTaskStatus(id);
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      toast.success(newStatus === "completed" ? "Task Completed! 🎉" : "Task moved to Pending");
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // Filter tasks based on search and time
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    return tasks.filter(task => {
      // Search filter
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase()) ||
        task.workshopName?.toLowerCase().includes(search.toLowerCase());

      // Time filter
      let matchesTime = true;
      if (selectedFilter !== "all" && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (selectedFilter === "today") {
          matchesTime = taskDate.toDateString() === today.toDateString();
        } else if (selectedFilter === "week") {
          matchesTime = taskDate >= weekAgo;
        } else if (selectedFilter === "month") {
          matchesTime = taskDate >= monthAgo;
        }
      } else if (selectedFilter !== "all" && !task.dueDate) {
        matchesTime = false;
      }

      return matchesSearch && matchesTime;
    });
  }, [tasks, search, selectedFilter]);

  // Group tasks by status for better organization
  const groupedTasks = useMemo(() => {
    const pending = filteredTasks.filter(t => t.status !== "completed");
    const completed = filteredTasks.filter(t => t.status === "completed");
    return { pending, completed };
  }, [filteredTasks]);

  const clearSearch = () => setSearch("");

  if (loading) return <TaskSkeleton viewMode={viewMode} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* ================= HEADER ================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-2 rounded-xl">
                <Grid3x3 size={20} />
              </span>
              My Tasks
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Clock size={14} />
              {filteredTasks.length} tasks • {groupedTasks.pending.length} pending
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:text-indigo-600"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:text-indigo-600"
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>

            {/* Add Task Button */}
            <Link
              to="/tasks/create-self"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Task</span>
            </Link>
          </div>
        </header>

        {/* ================= SEARCH & FILTERS ================= */}
        <div className="mb-6 space-y-3">
          {/* Search Bar - Google Keep Style */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search your tasks..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Chips - Google Keep Style */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                showFilters 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
            >
              <Filter size={14} />
              Filters
            </button>

            {["all", "today", "week", "month"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedFilter === filter
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Active Filters Display */}
          {(search || selectedFilter !== "all") && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
              <span>Active filters:</span>
              {search && (
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  "{search}"
                  <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedFilter !== "all" && (
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  {selectedFilter}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ================= TASKS GRID/LIST ================= */}
        {filteredTasks.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className="space-y-8">
            {/* Pending Tasks Section */}
            {groupedTasks.pending.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Pending • {groupedTasks.pending.length}
                </h2>
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-2"
                }>
                  {groupedTasks.pending.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      user={user}
                      onToggle={handleToggle}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Tasks Section */}
            {groupedTasks.completed.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Completed • {groupedTasks.completed.length}
                </h2>
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-2"
                }>
                  {groupedTasks.completed.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      user={user}
                      onToggle={handleToggle}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= TASK CARD - Google Keep Style ================= */
function TaskCard({ task, user, onToggle, viewMode }) {
  const isSelfTask = task.createdBy === user.id || task.createdBy?._id === user.id;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

  if (viewMode === "list") {
    return (
      <Link
        to={`/tasks/${task._id}`}
        className="group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all"
      >
        <button
          onClick={(e) => onToggle(e, task._id, task.status)}
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            task.status === 'completed' 
              ? 'bg-emerald-500 text-white' 
              : 'border-2 border-slate-200 text-slate-300 hover:border-indigo-600 hover:text-indigo-600'
          }`}
        >
          {task.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
            {task.title}
          </h3>
          {task.workshopName && (
            <p className="text-xs text-slate-400 mt-0.5">{task.workshopName}</p>
          )}
        </div>

        {isOverdue && <Clock size={14} className="text-rose-500 shrink-0" />}
        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 shrink-0" />
      </Link>
    );
  }

  // Grid View - Google Keep Style Card
  return (
    <Link
      to={`/tasks/${task._id}`}
      className="group block bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
    >
      {/* Color Accent Bar - Like Google Keep */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        task.status === 'completed' 
          ? 'bg-emerald-500' 
          : isOverdue 
            ? 'bg-rose-500' 
            : 'bg-indigo-500'
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <button
          onClick={(e) => onToggle(e, task._id, task.status)}
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            task.status === 'completed' 
              ? 'bg-emerald-500 text-white' 
              : 'border-2 border-slate-200 text-slate-300 hover:border-indigo-600 hover:text-indigo-600'
          }`}
        >
          {task.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>

        {/* Labels */}
        <div className="flex gap-1">
          {isSelfTask ? (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-[10px] font-medium">
              <User size={10} />
              Self
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-medium">
              <UserCheck size={10} />
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className={`font-bold text-base ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2 text-xs">
        {task.workshopName && (
          <span className="flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-1 rounded-lg">
            <Briefcase size={12} />
            <span className="truncate max-w-[80px]">{task.workshopName}</span>
          </span>
        )}

        {task.dueDate && (
          <span className={`flex items-center gap-1 ml-auto ${
            isOverdue ? 'text-rose-500 font-medium' : 'text-slate-400'
          }`}>
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        )}
      </div>

      {/* Hover Actions */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit3 size={14} className="text-slate-300" />
      </div>
    </Link>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyState({ search }) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Inbox size={24} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {search ? "No matching tasks" : "No tasks yet"}
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        {search ? "Try different search terms" : "Create your first task to get started"}
      </p>
      {!search && (
        <Link
          to="/tasks/create-self"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={18} />
          Create New Task
        </Link>
      )}
    </div>
  );
}

/* ================= SKELETON LOADING ================= */
function TaskSkeleton({ viewMode }) {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="h-16 bg-slate-100 rounded-2xl mb-6 animate-pulse" />
      <div className="h-12 bg-slate-50 rounded-2xl mb-6 animate-pulse" />
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between">
                <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                <div className="w-16 h-6 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-5 w-3/4 bg-slate-100 rounded" />
              <div className="h-4 w-full bg-slate-50 rounded" />
              <div className="h-4 w-2/3 bg-slate-50 rounded" />
              <div className="h-8 w-full bg-slate-100 rounded-lg mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}