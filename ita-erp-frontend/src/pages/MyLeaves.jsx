import { useEffect, useState } from "react";
import { fetchMyLeaves } from "../services/leaveService";
import dayjs from "dayjs";
import { Calendar, Clock, ChevronRight, Info } from "lucide-react";

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeaves()
      .then((res) => {
        setLeaves(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Request History</h2>
          <p className="text-sm text-slate-500">Track your leave and WFH status</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Calendar className="text-blue-600" size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          // Skeleton Loader
          [1, 2, 3].map((n) => (
            <div key={n} className="h-24 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))
        ) : leaves.length > 0 ? (
          leaves.map((l) => (
            <div 
              key={l._id} 
              className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={`mt-1 p-2 rounded-xl shrink-0 ${getTypeStyles(l.type)}`}>
                    <Clock size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">
                        {l.type}
                      </h3>
                      <span className="text-slate-300">•</span>
                      <p className="text-xs font-semibold text-slate-500">
                        {dayjs(l.fromDate).format("MMM D")} - {dayjs(l.toDate).format("MMM D, YYYY")}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                      "{l.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <StatusBadge status={l.status} />
                  <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors hidden sm:block" size={18} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Info className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-500 font-medium">No requests found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getTypeStyles(type) {
  switch (type?.toLowerCase()) {
    case 'wfh': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30';
    case 'leave': return 'bg-rose-50 text-rose-600 dark:bg-rose-900/30';
    default: return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30';
  }
}

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}