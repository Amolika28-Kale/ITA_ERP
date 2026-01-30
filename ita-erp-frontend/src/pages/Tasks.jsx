// import { useEffect, useState, useMemo } from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { fetchTasksByProject, updateTaskStatus } from "../services/taskService";
// import TaskModal from "../components/TaskModal";
// import {
//   Plus, CheckCircle2, Circle, Clock, Layout, 
//   Calendar, User as UserIcon, MoreHorizontal
// } from "lucide-react";

// const COLUMNS = [
//   { id: "todo", title: "To Do", color: "bg-slate-400" },
//   { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
//   { id: "review", title: "Review", color: "bg-amber-500" },
//   { id: "completed", title: "Done", color: "bg-emerald-500" },
// ];

// export default function Tasks() {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [activeTab, setActiveTab] = useState("todo");
//   const [userFilter, setUserFilter] = useState("all");
//   const [dateFilter, setDateFilter] = useState("all");

//   const loadTasks = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchTasksByProject();
//       setTasks(res.data);
//     } catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   useEffect(() => { loadTasks(); }, []);

//   const filteredTasks = useMemo(() => {
//     const today = new Date();
//     today.setHours(0,0,0,0);
//     return tasks.filter(task => {
//       if (userFilter !== "all" && !task.assignedTo?.some(u => u._id === userFilter)) return false;
//       if (dateFilter !== "all" && task.dueDate) {
//         const due = new Date(task.dueDate);
//         due.setHours(0,0,0,0);
//         if (dateFilter === "today" && due.getTime() !== today.getTime()) return false;
//         if (dateFilter === "overdue" && !(due < today && task.status !== "completed")) return false;
//         if (dateFilter === "upcoming" && due <= today) return false;
//       }
//       return true;
//     });
//   }, [tasks, userFilter, dateFilter]);

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const { draggableId, destination } = result;
//     setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: destination.droppableId } : t));
//     try { await updateTaskStatus(draggableId, destination.droppableId); } catch { loadTasks(); }
//   };

//   const users = useMemo(() => {
//     const map = {};
//     tasks.forEach(t => t.assignedTo?.forEach(u => { if (u._id) map[u._id] = u; }));
//     return Object.values(map);
//   }, [tasks]);

//   return (
//     <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
//       {/* --- COMPACT STICKY HEADER --- */}
//       <header className="px-6 py-4 flex flex-col md:flex-row justify-between items-center bg-white border-b border-slate-200 z-50">
//         <div className="flex items-center gap-3">
//           <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-indigo-100 shadow-lg">
//             <Layout size={20} strokeWidth={2.5} />
//           </div>
//           <h1 className="text-xl font-black text-slate-800 tracking-tight">Task Board</h1>
//         </div>

//         <div className="flex items-center gap-3 mt-4 md:mt-0">
//           <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
//             <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="bg-transparent border-none text-[11px] font-bold uppercase p-1.5 outline-none cursor-pointer text-slate-500">
//               <option value="all">Team</option>
//               {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
//             </select>
//             <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-transparent border-none text-[11px] font-bold uppercase p-1.5 outline-none cursor-pointer text-slate-500">
//               <option value="all">Timeline</option>
//               <option value="today">Today</option>
//               <option value="overdue">Overdue</option>
//             </select>
//           </div>
//           <button onClick={() => { setSelectedTask(null); setOpenModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95">
//             + New
//           </button>
//         </div>
//       </header>

//       {/* --- SCROLLABLE BOARD --- */}
//       <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
//         {loading ? <BoardSkeleton /> : (
//           <DragDropContext onDragEnd={onDragEnd}>
//             <div className="flex gap-6 h-full items-start">
//               {COLUMNS.map(col => (
//                 <div key={col.id} className="flex-shrink-0 w-[280px] lg:w-[320px] flex flex-col h-full">
//                   <div className="flex items-center justify-between mb-3 px-2">
//                     <div className="flex items-center gap-2">
//                       <div className={`h-2 w-2 rounded-full ${col.color}`} />
//                       <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">{col.title}</h3>
//                       <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded">{filteredTasks.filter(t => t.status === col.id).length}</span>
//                     </div>
//                   </div>

//                   <Droppable droppableId={col.id}>
//                     {(provided, snapshot) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.droppableProps}
//                         className={`flex-1 overflow-y-auto no-scrollbar rounded-2xl p-2 transition-colors ${
//                           snapshot.isDraggingOver ? 'bg-indigo-50/50' : 'bg-slate-50/30'
//                         }`}
//                       >
//                         {filteredTasks.filter(t => t.status === col.id).map((task, i) => (
//                           <Draggable key={task._id} draggableId={task._id} index={i}>
//                             {(provided, snap) => (
//                               <TaskCard task={task} provided={provided} isDragging={snap.isDragging} onClick={() => { setSelectedTask(task); setOpenModal(true); }} />
//                             )}
//                           </Draggable>
//                         ))}
//                         {provided.placeholder}
//                       </div>
//                     )}
//                   </Droppable>
//                 </div>
//               ))}
//             </div>
//           </DragDropContext>
//         )}
//       </main>

//       {openModal && <TaskModal task={selectedTask} onClose={() => setOpenModal(false)} onSaved={loadTasks} />}
//     </div>
//   );
// }

// function TaskCard({ task, provided, isDragging, onClick }) {
//   const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

//   return (
//     <div
//       ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={onClick}
//       className={`group bg-white p-3.5 rounded-xl mb-3 border border-slate-200 transition-all shadow-sm
//         ${isDragging ? "shadow-xl ring-2 ring-indigo-500/20 rotate-1 scale-105" : "hover:border-indigo-300 hover:shadow-md"}`}
//     >
//       <div className="flex justify-between items-center mb-2">
//         <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
//           task.priority === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
//         }`}>
//           {task.priority || "Normal"}
//         </span>
//         {task.status === "completed" && <CheckCircle2 size={14} className="text-emerald-500" />}
//       </div>

//       <h4 className="text-[13px] font-semibold text-slate-800 leading-tight mb-3 line-clamp-2">{task.title}</h4>

//       <div className="flex items-center justify-between pt-2.5 border-t border-slate-50">
//         <div className="flex -space-x-1.5">
//           {task.assignedTo?.slice(0, 3).map((u, idx) => (
//             <div key={idx} className="h-6 w-6 rounded-full border border-white bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600">
//               {u.name?.charAt(0)}
//             </div>
//           ))}
//         </div>
        
//         {task.dueDate && (
//           <div className={`flex items-center gap-1 text-[9px] font-bold ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
//             <Clock size={10} />
//             {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function BoardSkeleton() {
//   return (
//     <div className="flex gap-6 h-full">
//       {[1, 2, 3, 4].map(i => (
//         <div key={i} className="w-[300px] bg-slate-100/50 rounded-2xl animate-pulse h-full" />
//       ))}
//     </div>
//   );
// }