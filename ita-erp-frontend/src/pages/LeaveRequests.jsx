import { useEffect, useState } from "react";
import { fetchLeaveRequests, updateLeaveStatus } from "../services/leaveService";
import dayjs from "dayjs";
import { Check, X, User, Calendar, MessageSquare } from "lucide-react";

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchLeaveRequests();
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (id, status) => {
    setProcessingId(id);
    try {
      await updateLeaveStatus(id, status);
      setLeaves(prev => prev.filter(l => l._id !== id)); 
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Pending Approvals
            </h2>
            <p className="text-slate-500 text-sm font-medium">Review and manage employee absence requests.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 hidden sm:block">
            <span className="text-blue-600 font-bold">{leaves.length}</span>
            <span className="text-slate-400 text-sm ml-2 font-medium">Requests</span>
          </div>
        </div>

        {/* List Content */}
        <div className="grid gap-4">
          {loading ? (
            [1, 2, 3].map(n => <div key={n} className="h-32 bg-slate-200 animate-pulse rounded-[2rem]" />)
          ) : leaves.length > 0 ? (
            leaves.map((l) => (
              <div 
                key={l._id} 
                className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Employee Info & Details */}
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-50">
                      <User className="text-slate-400" size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">
                        {l.employee.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {l.type || 'Leave'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-slate-400" />
                          {dayjs(l.fromDate).format("MMM D")} — {dayjs(l.toDate).format("MMM D")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reason Section */}
                  <div className="md:max-w-xs flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex gap-2">
                      <MessageSquare size={14} className="text-slate-400 mt-1 shrink-0" />
                      <p className="text-sm text-slate-600 line-clamp-2 italic">
                        "{l.reason}"
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => action(l._id, "rejected")}
                      disabled={processingId === l._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-colors disabled:opacity-50"
                    >
                      <X size={18} />
                      <span className="md:hidden lg:inline">Reject</span>
                    </button>
                    <button
                      onClick={() => action(l._id, "approved")}
                      disabled={processingId === l._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      <Check size={18} />
                      <span className="md:hidden lg:inline">Approve</span>
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-bold">Inbox Zero!</p>
              <p className="text-slate-400 text-sm">No pending leave requests to review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}