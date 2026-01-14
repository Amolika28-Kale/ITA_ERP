import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { 
  CheckCircle2, 
  Clock, 
  Folder, 
  ChevronRight, 
  Filter,
  Calendar,
  AlertCircle,
  ChevronLeft
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  useEffect(() => {
    API.get("/tasks/my")
      .then(res => {
        setTasks(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Pagination Logic
  const { currentTasks, totalPages } = useMemo(() => {
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    return {
      currentTasks: tasks.slice(indexOfFirstTask, indexOfLastTask),
      totalPages: Math.ceil(tasks.length / tasksPerPage)
    };
  }, [tasks, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-4 px-6">
      {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-[2rem] animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 font-medium text-sm">
            Pending: <span className="text-indigo-600 font-bold">{tasks.filter(t => t.status !== 'completed').length}</span>
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-600 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
          <Filter size={14} /> Filter
        </button>
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
          <>
            {currentTasks.map(task => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                    {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate text-lg">
                      {task.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {task.project && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase">
                          <Folder size={10} /> {task.project.name}
                        </span>
                      )}
                      
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg border uppercase ${new Date(task.dueDate) < new Date() ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {new Date(task.dueDate) < new Date() ? <AlertCircle size={10} /> : <Calendar size={10} />}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-none pt-4 md:pt-0">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_THEMES[task.status] || STATUS_THEMES.todo}`}>
                    {task.status.replace("-", " ")}
                  </span>
                  <div className="h-10 w-10 flex items-center justify-center bg-slate-50 text-slate-300 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            ))}

            {/* --- PAGINATION CONTROLS --- */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 px-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Desktop Numbering */}
                  <div className="hidden sm:flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`h-10 w-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Indicator (Visible only on small screens) */}
                  <div className="sm:hidden px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600">
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}