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
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Request History</h2>
          <p className="text-sm text-slate-600 font-medium">Track your leave and WFH status</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
          <Calendar className="text-indigo-600" size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          // Skeleton Loader
          [1, 2, 3].map((n) => (
            <div key={n} className="h-24 w-full bg-slate-200 animate-pulse rounded-2xl" />
          ))
        ) : leaves.length > 0 ? (
          leaves.map((l) => (
            <div 
              key={l._id} 
              className="group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all active:scale-[0.99]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={`mt-1 p-2.5 rounded-xl shrink-0 ${getTypeStyles(l.type)}`}>
                    <Clock size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                        {l.type}
                      </h3>
                      <span className="text-slate-300">•</span>
                      <p className="text-xs font-bold text-indigo-600">
                        {dayjs(l.fromDate).format("MMM D")} - {dayjs(l.toDate).format("MMM D, YYYY")}
                      </p>
                    </div>
                    {/* Reason text - Darkened for visibility */}
                    <p className="text-[13px] text-slate-700 font-medium line-clamp-1 italic">
                      "{l.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-50 sm:border-t-0 pt-3 sm:pt-0">
                  <StatusBadge status={l.status} />
                  <ChevronRight className="text-slate-400 group-hover:text-indigo-600 transition-colors hidden sm:block" size={18} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Info className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-600 font-bold">No requests found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getTypeStyles(type) {
  // Brighter background colors with darker text for better contrast
  switch (type?.toLowerCase()) {
    case 'wfh': return 'bg-blue-100 text-blue-700';
    case 'leave': return 'bg-rose-100 text-rose-700';
    default: return 'bg-amber-100 text-amber-700';
  }
}

function StatusBadge({ status }) {
  // Using solid text colors on light backgrounds
  const styles = {
    approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    rejected: "bg-rose-100 text-rose-800 border border-rose-200",
    pending: "bg-amber-100 text-amber-800 border border-amber-200",
  };

  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}