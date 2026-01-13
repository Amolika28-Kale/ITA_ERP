import { Calendar } from "lucide-react";

export default function TaskReminderPopup({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
        
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />

        <div className="p-6">
          {/* Header & Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-xl"><Calendar/></span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Task Summary
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Action Required
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{data.pending}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{data.overdue}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <a
              href="/my-tasks"
              className="flex-1 inline-flex justify-center items-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              View Tasks
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}