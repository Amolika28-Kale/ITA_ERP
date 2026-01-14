import { Calendar, X } from "lucide-react";

export default function TaskReminderPopup({ data, onClose }) {
  if (!data) return null;

  const {
    pendingCount = 0,
    overdueCount = 0,
    pendingTasks = [],
    overdueTasks = [],
  } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      
      {/* Backdrop: Softened the blur and darkened overlay slightly for focus */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal: Focused on White/Gray/Blue palette */}
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
        
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />

        {/* Close Button (Top Right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                Task Summary
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                Action Required
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Pending</p>
              <p className="text-3xl font-black text-slate-800">
                {pendingCount}
              </p>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-[10px] font-bold uppercase text-rose-600 mb-1">Overdue</p>
              <p className="text-3xl font-black text-rose-700">
                {overdueCount}
              </p>
            </div>
          </div>

          {/* Task Scroll Area */}
          <div className="space-y-5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">

            {/* Overdue Section (Highest Priority) */}
            {overdueTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-rose-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                  Overdue
                </h3>
                <ul className="space-y-2">
                  {overdueTasks.map((task) => (
                    <li
                      key={task._id}
                      className="flex gap-3 items-center bg-rose-50/50 p-3 rounded-xl text-sm border border-rose-100/50"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-slate-700 font-medium truncate">
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pending Section */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  Pending Today
                </h3>
                <ul className="space-y-2">
                  {pendingTasks.map((task) => (
                    <li
                      key={task._id}
                      className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl text-sm border border-slate-100"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-slate-700 font-medium truncate">
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty State */}
            {pendingTasks.length === 0 && overdueTasks.length === 0 && (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm font-bold text-slate-800">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending or overdue tasks.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <a
              href="/my-tasks"
              className="w-full text-center px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
              Go to My Tasks
            </a>
            <button
              onClick={onClose}
              className="w-full px-5 py-3 rounded-2xl text-slate-500 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Dismiss
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}