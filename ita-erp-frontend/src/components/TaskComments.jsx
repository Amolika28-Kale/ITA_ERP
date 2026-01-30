// import { useEffect, useState } from "react";
// import { fetchTaskComments, addTaskComment } from "../services/taskService";
// import { Send, MessageSquare, Clock, User as UserIcon } from "lucide-react";

// export default function TaskComments({ taskId }) {
//   const [comments, setComments] = useState([]);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const loadComments = async () => {
//     const res = await fetchTaskComments(taskId);
//     setComments(res.data);
//   };

//   useEffect(() => {
//     if (taskId) loadComments();
//   }, [taskId]);

//   const submit = async () => {
//     if (!message.trim()) return;
//     setLoading(true);
//     try {
//       await addTaskComment(taskId, message);
//       setMessage("");
//       await loadComments();
//     } catch (err) {
//       console.error("Comment failed", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full max-h-[500px]">
//       {/* --- HEADER --- */}
//       <div className="flex items-center gap-2 mb-4">
//         <MessageSquare size={18} className="text-indigo-500" />
//         <h3 className="font-bold text-slate-800 tracking-tight">Discussion</h3>
//         <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
//           {comments.length}
//         </span>
//       </div>

//       {/* --- COMMENTS LIST --- */}
//       <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar min-h-[200px]">
//         {comments.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-10 opacity-40">
//             <MessageSquare size={32} strokeWidth={1} />
//             <p className="text-xs font-medium mt-2">Start the conversation...</p>
//           </div>
//         ) : (
//           comments.map((c) => (
//             <div key={c._id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
//               {/* Avatar */}
//               <div className="flex-shrink-0">
//                 <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shadow-sm uppercase">
//                   {c.user?.name?.charAt(0) || <UserIcon size={14}/>}
//                 </div>
//               </div>

//               {/* Bubble */}
//               <div className="flex-1 space-y-1">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-bold text-slate-800">{c.user?.name}</span>
//                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
//                     <Clock size={10} />
//                     {/* If you have createdAt, format it here. Example: '2h ago' */}
//                     {c.createdAt ? "Recent" : "Just now"}
//                   </span>
//                 </div>
//                 <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none text-sm text-slate-600 leading-relaxed shadow-sm group-hover:bg-white group-hover:border-indigo-100 transition-colors">
//                   {c.message}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* --- INPUT AREA --- */}
//       <div className="mt-6 relative">
//         <textarea
//           rows={1}
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => {
//              if(e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 submit();
//              }
//           }}
//           placeholder="Share an update or feedback..."
//           className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 pr-14 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm transition-all"
//         />
//         <button
//           onClick={submit}
//           disabled={loading || !message.trim()}
//           className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-30 disabled:shadow-none transition-all active:scale-90"
//         >
//           {loading ? <LoaderIcon /> : <Send size={18} />}
//         </button>
//       </div>
//     </div>
//   );
// }

// function LoaderIcon() {
//   return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
// }