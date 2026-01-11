import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getTaskDetails,
  updateTaskStatus,
  addTaskComment,
  updateTaskComment,
  fetchTaskActivity
} from "../services/taskService";
import { 
  ArrowLeft, Clock, Flag, CheckCircle2, 
  MessageSquare, History, Send, Edit3 
} from "lucide-react";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [activity, setActivity] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee = user.role === "employee";

  const load = async () => {
    const res = await getTaskDetails(id);
    setData(res.data);
    const act = await fetchTaskActivity(id);
    setActivity(act.data);
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return <div className="p-10 text-center animate-pulse text-slate-400">Loading Task Details...</div>;

  const { task, subtasks, comments } = data;

  const changeStatus = async (status) => {
    await updateTaskStatus(task._id, status);
    load();
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    await addTaskComment(task._id, comment);
    setComment("");
    load();
  };

  const priorityColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-emerald-100 text-emerald-700",
    urgent: "bg-purple-100 text-purple-700 animate-pulse"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* --- TOP NAVIGATION & HEADER --- */}
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit">
          <ArrowLeft size={18} /> <span className="text-sm font-bold">Back to Board</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-black text-slate-800 tracking-tight">{task.title}</h1>
               <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>
                  {task.priority}
               </span>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl">{task.description || "No description provided."}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {["todo", "in-progress", "review", "completed"].map(s => (
              <button
                key={s}
                disabled={isEmployee && task.assignedTo?._id !== user.id}
                onClick={() => changeStatus(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all
                  ${task.status === s 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "text-slate-400 hover:text-slate-600"}`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Subtasks & Details */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="text-indigo-500" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Checklist</h2>
            </div>

            <div className="space-y-3">
              {subtasks.map(st => (
                <div key={st._id} className="group flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                      checked={st.status === "completed"}
                      onChange={async () => {
                        await updateTaskStatus(st._id, st.status === "completed" ? "todo" : "completed");
                        load();
                      }}
                    />
                    <span className={`text-sm font-medium ${st.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                      {st.title}
                    </span>
                  </div>
                </div>
              ))}
              {subtasks.length === 0 && <p className="text-center py-6 text-slate-400 text-sm italic">No subtasks found.</p>}
            </div>
          </section>

          {/* DISCUSSION SECTION */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="text-indigo-500" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Discussion</h2>
            </div>

            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map(c => (
                <div key={c._id} className="flex gap-4 group">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 uppercase">
                    {c.user?.name?.charAt(0) || "S"}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{c.user?.name || "System"}</span>
                      {c.user?._id === user.id && !editingId && (
                        <button onClick={() => { setEditingId(c._id); setEditText(c.message); }} className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 font-bold uppercase transition-all">Edit</button>
                      )}
                    </div>
                    
                    {editingId === c._id ? (
                      <div className="space-y-2">
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-3 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <div className="flex gap-2">
                          <button onClick={async () => { await updateTaskComment(c._id, editText); setEditingId(null); load(); }} className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 text-[10px] font-bold text-slate-500">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none inline-block">{c.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-4 pr-12 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm transition-all"
                placeholder="Share an update..."
                rows={2}
              />
              <button onClick={submitComment} className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
                <Send size={18} />
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Activity Timeline */}
   {/* RIGHT COLUMN: Activity Timeline */}
<div className="lg:col-span-5">
  <section className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl sticky top-6">
    <div className="flex items-center gap-2 mb-8">
      <History className="text-indigo-400" size={20} />
      <h2 className="text-lg font-bold">Task Activity</h2>
    </div>

    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-white/10">
      {activity.map(a => (
        <div key={a._id} className="relative flex items-start gap-6">
          
          {/* DOT */}
          <div className="absolute left-0 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 ring-2 ring-white/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </div>

          {/* CONTENT */}
          <div className="ml-8">
            <p className="text-sm leading-snug">
              <span className="font-bold text-indigo-300">
                {a.performedBy?.name || "System"}
              </span>{" "}
              {a.message}
            </p>

            <time className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1 block">
              {new Date(a.createdAt).toLocaleString([], {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </time>
          </div>
        </div>
      ))}

      {activity.length === 0 && (
        <p className="text-slate-500 text-xs italic ml-8">
          No activity recorded yet.
        </p>
      )}
    </div>
  </section>
</div>


      </div>
    </div>
  );
}