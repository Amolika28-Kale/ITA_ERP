import { useEffect, useState } from "react";
import { fetchActivityByTask } from "../services/activityService";
import { 
  History, 
  Circle, 
  User as UserIcon, 
  Clock, 
  ArrowRightCircle 
} from "lucide-react";

export default function TaskActivity({ taskId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    fetchActivityByTask(taskId)
      .then((res) => setLogs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading) return <div className="animate-pulse h-20 bg-slate-50 rounded-2xl mt-6" />;

  if (!logs.length) {
    return (
      <div className="mt-8 p-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
        <History className="mx-auto text-slate-200 mb-2" size={24} />
        <p className="text-xs font-medium text-slate-400">No history available for this task</p>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <History size={18} className="text-slate-400" />
        <h3 className="font-bold text-slate-800 tracking-tight text-sm">Activity Log</h3>
        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-black">
          {logs.length}
        </span>
      </div>

      {/* Timeline Wrapper */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:ml-[1.65rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
        {logs.map((log, index) => (
          <div key={log._id} className="relative flex items-start gap-4 md:gap-6 group">
            
            {/* Timeline Node Icon */}
            <div className="absolute left-0 flex items-center justify-center w-6 h-6 rounded-full bg-white ring-4 ring-white md:w-8 md:h-8 md:left-0 md:ml-0.5">
               <div className="flex items-center justify-center w-full h-full rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-slate-200">
                  <ActivityIcon message={log.message} />
               </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 ml-8 md:ml-12 pt-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">{log.performedBy?.name}</span>
                  {" "}{parseActionMessage(log.message)}
                </p>
                <time className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                  <Clock size={10} />
                  {formatLogDate(log.createdAt)}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

// Dynamically chooses an icon based on keywords in the message
function ActivityIcon({ message }) {
  const msg = message.toLowerCase();
  if (msg.includes("completed") || msg.includes("done")) return <ArrowRightCircle size={14} className="text-emerald-500 group-hover:text-white" />;
  if (msg.includes("assigned")) return <UserIcon size={14} />;
  return <Circle size={8} fill="currentColor" />;
}

// Stylizes the message by bolding specific status keywords
function parseActionMessage(message) {
  const keywords = ["Completed", "In Progress", "Review", "To Do", "High", "Urgent"];
  let styledMessage = message;
  
  keywords.forEach(word => {
    if (message.includes(word)) {
      styledMessage = message.replace(word, `<span class="text-indigo-600 font-bold">${word}</span>`);
    }
  });

  return <span dangerouslySetInnerHTML={{ __html: styledMessage }} />;
}

function formatLogDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}