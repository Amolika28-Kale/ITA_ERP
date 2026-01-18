import { useEffect, useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchTasksByProject, updateTaskStatus } from "../services/taskService";
import TaskModal from "../components/TaskModal";
import {
  Plus, AlertCircle, Clock, List, CheckCircle2, 
  Circle, Filter, Calendar, User as UserIcon, Layout
} from "lucide-react";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-slate-400", light: "bg-slate-50" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-500", light: "bg-blue-50" },
  { id: "review", title: "Review", color: "bg-amber-500", light: "bg-amber-50" },
  { id: "completed", title: "Done", color: "bg-emerald-500", light: "bg-emerald-50" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Mobile specific state: which column to show
  const [activeTab, setActiveTab] = useState("todo");

  const [userFilter, setUserFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await fetchTasksByProject();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return tasks.filter(task => {
      if (userFilter !== "all" && task.assignedTo?._id !== userFilter) return false;
      if (dateFilter !== "all" && task.dueDate) {
        const due = new Date(task.dueDate);
        due.setHours(0,0,0,0);
        if (dateFilter === "today" && due.getTime() !== today.getTime()) return false;
        if (dateFilter === "overdue" && !(due < today && task.status !== "completed")) return false;
        if (dateFilter === "upcoming" && due <= today) return false;
      }
      return true;
    });
  }, [tasks, userFilter, dateFilter]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: destination.droppableId } : t));
    try { await updateTaskStatus(draggableId, destination.droppableId); } catch { loadTasks(); }
  };

  const users = useMemo(() => {
    const map = {};
    tasks.forEach(t => { if (t.assignedTo?._id) map[t.assignedTo._id] = t.assignedTo; });
    return Object.values(map);
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      {/* --- HEADER --- */}
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Layout size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Project Board</h2>
            <p className="text-sm text-slate-400 font-medium">
              {filteredTasks.length} active tasks found
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all appearance-none"
            >
              <option value="all">Team Members</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>

          <div className="relative flex-1 md:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all appearance-none"
            >
              <option value="all">Timeline</option>
              <option value="today">Today</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          <button
            onClick={() => { setSelectedTask(null); setOpenModal(true); }}
            className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      </header>

      {/* --- MOBILE TAB NAVIGATION --- */}
      <div className="flex md:hidden overflow-x-auto gap-2 mb-6 no-scrollbar">
        {COLUMNS.map(col => (
          <button
            key={col.id}
            onClick={() => setActiveTab(col.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
              activeTab === col.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500'
            }`}
          >
            {col.title}
          </button>
        ))}
      </div>

      {/* --- BOARD --- */}
      {loading ? (
        <BoardSkeleton />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
            {COLUMNS.map(col => (
              <div 
                key={col.id} 
                className={`flex-shrink-0 w-full md:w-[320px] lg:w-[350px] ${activeTab !== col.id ? 'hidden md:block' : 'block'}`}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-6 rounded-full ${col.color}`} />
                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">
                      {col.title}
                    </h3>
                  </div>
                  <span className="bg-white px-2.5 py-1 rounded-lg border text-xs font-bold text-slate-500 shadow-sm">
                    {filteredTasks.filter(t => t.status === col.id).length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-[2rem] p-3 min-h-[500px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed' : 'bg-slate-100/50'
                      }`}
                    >
                      {filteredTasks
                        .filter(t => t.status === col.id)
                        .map((task, i) => (
                          <Draggable key={task._id} draggableId={task._id} index={i}>
                            {(provided, snap) => (
                              <TaskCard
                                task={task}
                                provided={provided}
                                isDragging={snap.isDragging}
                                onClick={() => { setSelectedTask(task); setOpenModal(true); }}
                              />
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {openModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => setOpenModal(false)}
          onSaved={loadTasks}
        />
      )}
    </div>
  );
}

function TaskCard({ task, provided, isDragging, onClick }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className={`group bg-white p-5 rounded-2xl mb-4 cursor-grab active:cursor-grabbing border-b-4 border-transparent transition-all
        ${isDragging ? "shadow-2xl scale-105 border-indigo-500 rotate-2" : "hover:shadow-xl hover:-translate-y-1 border-slate-200"}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
          task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {task.priority || "Low"}
        </span>
        {task.status === "completed"
          ? <div className="p-1 bg-emerald-100 rounded-full"><CheckCircle2 size={14} className="text-emerald-600" /></div>
          : <Circle size={14} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />}
      </div>

      <h4 className="font-bold text-slate-800 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
            {task.assignedTo?.name?.charAt(0) || "U"}
          </div>
          <span className="text-xs font-bold text-slate-500">{task.assignedTo?.name || "Assignee"}</span>
        </div>
        
        {task.dueDate && (
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isOverdue ? "text-rose-500" : "text-slate-400"}`}>
            <Clock size={12} strokeWidth={3} />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex-1 space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-[60vh] bg-slate-100 animate-pulse rounded-[2rem]" />
        </div>
      ))}
    </div>
  );
}