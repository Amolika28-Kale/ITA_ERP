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
  ArrowLeft, CheckCircle2, Circle, 
  Calendar, AlignLeft, ShieldCheck, Briefcase, User 
} from "lucide-react";
import toast from "react-hot-toast";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

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
      toast.success(isNowCompleted ? "Task Done! 🎉" : "Moved to Pending");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">
        Opening Task Ledger...
      </div>
    </div>
  );

  const isSelfTask = task.createdBy === user.id || task.createdBy?._id === user.id;

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      
      {/* --- TOP NAV --- */}
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-black text-[9px] uppercase tracking-widest px-1"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Queue
      </button>

      {/* --- MAIN TASK CARD --- */}
      <div className="bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/40 relative overflow-hidden">
        {/* Slim Status Bar */}
        <div className={`h-1.5 w-full transition-colors duration-500 ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'}`} />

        <div className="p-5 sm:p-8 flex flex-col md:flex-row justify-between gap-6 sm:gap-10">
          
          <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
            {/* Header Labels */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border 
                ${task.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                {task.priority} Priority
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border flex items-center gap-1
                ${isSelfTask ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                <User size={10} /> {isSelfTask ? "Self" : "Admin Assigned"}
              </span>
            </div>

            {/* Title & Workshop Section */}
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Briefcase size={14} className="md:size-[16px]" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate">
                  {task.workshopName || "General Assignment"}
                </span>
              </div>
              
              <h1 className={`text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight transition-all
                ${task.status === 'completed' ? 'line-through text-slate-300 opacity-60' : ''}`}>
                {task.title}
              </h1>

              <div className="flex items-start gap-3 bg-slate-50/60 p-4 md:p-5 rounded-2xl border border-slate-50">
                <AlignLeft size={16} className="text-slate-300 shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Instruction Brief</p>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium whitespace-pre-line">
                    {task.description || "No additional notes provided for this task."}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Tag */}
            {task.dueDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                <Calendar size={14} />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                  Due: {new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            )}
          </div>

          {/* --- INTERACTIVE ACTION BOX (Responsive Sidebar) --- */}
          <div className="w-full md:w-40 shrink-0 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-slate-50/80 p-4 md:p-6 rounded-[1.5rem] border border-white md:min-h-[220px]">
            <div className="text-left md:text-center space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <h3 className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {task.status}
              </h3>
            </div>
            
            <button 
              onClick={handleToggle}
              className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 shadow-lg active:scale-90
                ${task.status === 'completed' 
                  ? 'bg-emerald-500 text-white shadow-emerald-100 ring-4 ring-emerald-50' 
                  : 'bg-white text-slate-200 border border-slate-100 hover:border-indigo-400 hover:text-indigo-400'}`}
              title={task.status === 'completed' ? "Mark as Pending" : "Mark as Completed"}
            >
              {task.status === 'completed' ? <CheckCircle2 size={24} className="md:size-[32px]" /> : <Circle size={24} className="md:size-[32px]" />}
            </button>
          </div>

        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex items-center justify-center gap-2 py-4 opacity-40">
        <ShieldCheck size={12} className="text-slate-300" />
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">
          End-to-End Encrypted ERP Audit Trail
        </p>
      </div>

    </div>
  );
}