// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import {
//   getTaskDetails,
//   updateTaskStatus,
//   addTaskComment,
//   updateTaskComment,
//   fetchTaskActivity
// } from "../services/taskService";
// import { 
//   ArrowLeft, Clock, Flag, CheckCircle2, 
//   MessageSquare, History, Send, Edit3 
// } from "lucide-react";

// export default function TaskDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [data, setData] = useState(null);
//   const [comment, setComment] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editText, setEditText] = useState("");
//   const [activity, setActivity] = useState([]);

//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const isEmployee = user.role === "employee";

//   const load = async () => {
//     const res = await getTaskDetails(id);
//     setData(res.data);
//     const act = await fetchTaskActivity(id);
//     setActivity(act.data);
//   };

//   useEffect(() => { load(); }, [id]);

//   if (!data) return <div className="p-10 text-center animate-pulse text-slate-400">Loading Task Details...</div>;

//   const { task, subtasks, comments } = data;

//   const changeStatus = async (status) => {
//     await updateTaskStatus(task._id, status);
//     load();
//   };

//   const submitComment = async () => {
//     if (!comment.trim()) return;
//     await addTaskComment(task._id, comment);
//     setComment("");
//     load();
//   };

//   const priorityColors = {
//     high: "bg-red-100 text-red-700",
//     medium: "bg-amber-100 text-amber-700",
//     low: "bg-emerald-100 text-emerald-700",
//     urgent: "bg-purple-100 text-purple-700 animate-pulse"
//   };
// // Juni condition:
// // disabled={isEmployee && task.assignedTo?._id !== user.id}

// // Navin condition (Array check):
// const isAssignedToMe = Array.isArray(task.assignedTo) 
//   ? task.assignedTo.some(u => (u._id || u) === user.id)
//   : task.assignedTo?._id === user.id;

//   return (
//     <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
//       {/* --- TOP NAVIGATION & HEADER --- */}
//       <div className="flex flex-col gap-4">
//         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit">
//           <ArrowLeft size={18} /> <span className="text-sm font-bold">Back to Board</span>
//         </button>
        
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
//           <div className="space-y-1">
//             <div className="flex items-center gap-3">
//                <h1 className="text-2xl font-black text-slate-800 tracking-tight">{task.title}</h1>
//                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>
//                   {task.priority}
//                </span>
//             </div>
//             <p className="text-slate-500 text-sm max-w-2xl">{task.description || "No description provided."}</p>
//           </div>
          
//           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">


// {["todo", "in-progress", "review", "completed"].map(s => (
//   <button
//     key={s}
//     disabled={isEmployee && !isAssignedToMe} // Updated condition
//     onClick={() => changeStatus(s)}
//     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all
//       ${task.status === s 
//         ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
//         : "text-slate-400 hover:text-slate-600"}`}
//   >
//     {s.replace('-', ' ')}
//   </button>
// ))}
//           </div>
//         </div>
//       </div>

//       {/* --- MAIN CONTENT GRID --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
//         {/* LEFT COLUMN: Subtasks & Details */}
//         <div className="lg:col-span-7 space-y-6">
//  <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
//   <div className="flex items-center justify-between mb-6">
//     <div className="flex items-center gap-2">
//       <CheckCircle2 className="text-indigo-500" size={20} />
//       <h2 className="text-lg font-bold text-slate-800">Checklist</h2>
//     </div>
//     {/* प्रोग्रेस दाखवण्यासाठी एक छोटा इंडिकेटर (Optional) */}
//     <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">
//       {subtasks.filter(s => s.status === 'completed').length} / {subtasks.length} Done
//     </span>
//   </div>

//   <div className="space-y-3">
//     {subtasks.map(st => {
//       // ✅ परवानगी तपासा: जर Admin असेल किंवा या टास्कला असाइन असेल तरच बदल करता येईल
//       const isAssigned = task.assignedTo?.some(u => (u._id || u) === user.id);
//       const canEdit = user.role === 'admin' || user.role === 'manager' || isAssigned;

//       return (
//         <div 
//           key={st._id} 
//           className="group flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm hover:shadow-md"
//         >
//           <div className="flex items-center gap-4 w-full">
//             <input
//               type="checkbox"
//               disabled={!canEdit} // परमिशन नसेल तर डिसेबल करा
//               className={`w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all 
//                 ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
//               checked={st.status === "completed"}
//               onChange={async () => {
//                 if (!canEdit) return;
//                 const newStatus = st.status === "completed" ? "todo" : "completed";
//                 try {
//                   await updateTaskStatus(st._id, newStatus);
//                   load(); // डेटा रिफ्रेश करा
//                 } catch (err) {
//                   console.error("Checklist update failed:", err);
//                 }
//               }}
//             />
//             <div className="flex flex-col">
//               <span className={`text-sm font-bold transition-all ${
//                 st.status === "completed" ? "line-through text-slate-400" : "text-slate-700"
//               }`}>
//                 {st.title}
//               </span>
//               {/* कोणाला असाइन आहे ते पाहण्यासाठी (Optional) */}
//               {st.assignedTo?.length > 0 && (
//                 <span className="text-[9px] text-slate-400 font-medium">
//                   Assigned to: {st.assignedTo.map(u => u.name).join(", ")}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       );
//     })}

//     {subtasks.length === 0 && (
//       <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
//         <p className="text-slate-400 text-sm italic">No subtasks created yet.</p>
//       </div>
//     )}
//   </div>
// </section>

//           {/* DISCUSSION SECTION */}
//           <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
//             <div className="flex items-center gap-2 mb-6">
//               <MessageSquare className="text-indigo-500" size={20} />
//               <h2 className="text-lg font-bold text-slate-800">Task Comments</h2>
//             </div>

//             <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
//               {comments.map(c => (
//                 <div key={c._id} className="flex gap-4 group">
//                   <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 uppercase">
//                     {c.user?.name?.charAt(0) || "S"}
//                   </div>
//                   <div className="flex-1 space-y-1">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-bold text-slate-800">{c.user?.name || "System"}</span>
//                       {c.user?._id === user.id && !editingId && (
//                         <button onClick={() => { setEditingId(c._id); setEditText(c.message); }} className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 font-bold uppercase transition-all">Edit</button>
//                       )}
//                     </div>
                    
//                     {editingId === c._id ? (
//                       <div className="space-y-2">
//                         <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-3 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
//                         <div className="flex gap-2">
//                           <button onClick={async () => { await updateTaskComment(c._id, editText); setEditingId(null); load(); }} className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">Save</button>
//                           <button onClick={() => setEditingId(null)} className="px-3 py-1 text-[10px] font-bold text-slate-500">Cancel</button>
//                         </div>
//                       </div>
//                     ) : (
//                       <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none inline-block">{c.message}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="relative">
//               <textarea
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 className="w-full p-4 pr-12 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm transition-all"
//                 placeholder="Share an update..."
//                 rows={2}
//               />
//               <button onClick={submitComment} className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
//                 <Send size={18} />
//               </button>
//             </div>
//           </section>
//         </div>

//         {/* RIGHT COLUMN: Activity Timeline */}
//    {/* RIGHT COLUMN: Activity Timeline */}
// <div className="lg:col-span-5">
//   <section className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl sticky top-6">
//     <div className="flex items-center gap-2 mb-8">
//       <History className="text-indigo-400" size={20} />
//       <h2 className="text-lg font-bold">Task Activity</h2>
//     </div>

//     <div className="relative space-y-8 before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-white/10">
//       {activity.map(a => (
//         <div key={a._id} className="relative flex items-start gap-6">
          
//           {/* DOT */}
//           <div className="absolute left-0 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 ring-2 ring-white/20 flex items-center justify-center">
//             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
//           </div>

//           {/* CONTENT */}
//           <div className="ml-8">
//             <p className="text-sm leading-snug">
//               <span className="font-bold text-indigo-300">
//                 {a.performedBy?.name || "System"}
//               </span>{" "}
//               {a.message}
//             </p>

//             <time className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1 block">
//               {new Date(a.createdAt).toLocaleString([], {
//                 day: "numeric",
//                 month: "short",
//                 hour: "2-digit",
//                 minute: "2-digit"
//               })}
//             </time>
//           </div>
//         </div>
//       ))}

//       {activity.length === 0 && (
//         <p className="text-slate-500 text-xs italic ml-8">
//           No activity recorded yet.
//         </p>
//       )}
//     </div>
//   </section>
// </div>


//       </div>
//     </div>
//   );
// }

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTaskDetails, toggleTaskStatus } from "../services/taskService";
import { 
  ArrowLeft, CheckCircle2, Circle, Calendar, AlignLeft, 
  ShieldCheck, Briefcase, User, Clock, Tag, Edit3,
  AlertCircle, ChevronRight, MoreVertical, Copy, Trash2
} from "lucide-react";
import toast from "react-hot-toast";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadTask = async () => {
    try {
      setLoading(true);
      const res = await getTaskDetails(id);
      setTask(res.data);
    } catch (err) {
      toast.error("Could not load task details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTask(); }, [id]);

  const handleToggle = async () => {
    try {
      await toggleTaskStatus(task._id);
      const isNowCompleted = task.status !== "completed";
      setTask({ ...task, status: isNowCompleted ? "completed" : "pending" });
      toast.success(isNowCompleted ? "Task Completed! 🎉" : "Moved to Pending");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(task.title);
    toast.success("Task title copied");
  };

  if (loading) return <TaskDetailsSkeleton />;

  const isSelfTask = task.createdBy === user.id || task.createdBy?._id === user.id;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* ================= TOP NAVIGATION ================= */}
        <nav className="flex items-center justify-between mb-4 sm:mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-medium text-xs sm:text-sm px-2 py-1.5 rounded-lg hover:bg-indigo-50"
            aria-label="Go back"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Tasks</span>
          </button>

          {/* Mobile Actions Menu */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              aria-label="Task actions"
            >
              <MoreVertical size={18} />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                <button
                  onClick={handleCopyTitle}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-indigo-50 transition-colors"
                >
                  <Copy size={14} />
                  Copy Title
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ================= MAIN TASK CARD ================= */}
        <article className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
          
          {/* Color-coded header bar */}
          <header className={`h-2 w-full ${
            task.status === 'completed' 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
              : isOverdue
                ? 'bg-gradient-to-r from-rose-500 to-red-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`} />

          <div className="p-5 sm:p-8 lg:p-10">
            
            {/* ================= TASK METADATA ================= */}
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              {/* Priority Badge */}
              {task.priority && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider
                  ${task.priority === 'urgent' 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : task.priority === 'high'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                  <AlertCircle size={10} />
                  {task.priority} Priority
                </span>
              )}

              {/* Source Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border
                ${isSelfTask 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                <User size={10} />
                {isSelfTask ? 'Self Task' : 'Admin Assigned'}
              </span>
            </div>

            {/* ================= TITLE & WORKSHOP ================= */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-indigo-600">
                <Briefcase size={14} className="sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                  {task.workshopName || 'General Assignment'}
                </span>
              </div>
              
              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight break-words
                ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h1>
            </div>

            {/* ================= DESCRIPTION ================= */}
            <section aria-label="Task description" className="mb-6 sm:mb-8">
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlignLeft size={14} className="text-indigo-500" />
                  <h2 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </h2>
                </div>
                
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {task.description || (
                    <span className="text-slate-400 italic">No description provided</span>
                  )}
                </p>
              </div>
            </section>

            {/* ================= TASK DETAILS GRID ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              
              {/* Due Date Card */}
              {task.dueDate && (
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-indigo-500" />
                    <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due Date</h3>
                  </div>
                  <div className={`flex items-center gap-2 ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                    <time className="text-sm sm:text-base font-semibold">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </time>
                    {isOverdue && (
                      <span className="text-[9px] font-bold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Created By Card */}
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-indigo-500" />
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Created By</h3>
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-700">
                  {task.createdBy?.name || 'Unknown'}
                </p>
                {task.createdAt && (
                  <time className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(task.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                )}
              </div>
            </div>

            {/* ================= STATUS CONTROLS ================= */}
            <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-slate-100">
              
              {/* Status Toggle Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggle}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all shadow-md
                    ${task.status === 'completed' 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  aria-label={task.status === 'completed' ? "Mark as pending" : "Mark as completed"}
                >
                  {task.status === 'completed' ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle size={18} />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>

                {/* Desktop Action Buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={handleCopyTitle}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Copy title"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Last Updated */}
              {task.updatedAt && (
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock size={12} />
                  <time>
                    Updated {new Date(task.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              )}
            </footer>
          </div>
        </article>

        {/* ================= FOOTER ================= */}
        <footer className="flex items-center justify-between mt-6 sm:mt-8">
          <p className="text-[8px] sm:text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={12} className="text-slate-300" />
            ITA-ERP • Secure Task Management
          </p>
          
          <nav aria-label="Task navigation" className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <span>All Tasks</span>
              <ChevronRight size={12} />
            </button>
          </nav>
        </footer>
      </div>
    </div>
  );
}

/* ================= SKELETON LOADING ================= */
function TaskDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Back Button Skeleton */}
        <div className="h-8 w-24 bg-slate-100 rounded-lg mb-6 animate-pulse" />
        
        {/* Main Card Skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="h-2 bg-slate-100 w-full" />
          
          <div className="p-5 sm:p-8 lg:p-10 space-y-6">
            {/* Metadata Skeleton */}
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-slate-100 rounded animate-pulse" />
            </div>

            {/* Description Skeleton */}
            <div className="bg-slate-50 rounded-xl p-6 space-y-3">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Details Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>

            {/* Footer Skeleton */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}