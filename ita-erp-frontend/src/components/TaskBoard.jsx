import { useEffect, useState } from "react";
import { 
  fetchTasksByProject, 
  createTask, 
  updateTaskStatus 
} from "../services/taskService";
import { fetchUsers } from "../services/userService";
import Modal from "./Modal";
import { 
  Plus, Calendar, Clock, User, 
  AlertCircle, ChevronRight, MoreVertical 
} from "lucide-react";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-slate-500" },
  { id: "in-progress", label: "In Progress", color: "bg-indigo-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "completed", label: "Completed", color: "bg-emerald-500" }
];

export default function Tasks({  }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    assignedTo: "",
    priority: "medium",
    dueDate: ""
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [tRes, uRes] = await Promise.all([
      fetchTasksByProject(),
      fetchUsers()
    ]);
    setTasks(tRes.data);
    setUsers(uRes.data);
  };

  const handleStatusChange = async (taskId, currentStatus) => {
    const currentIndex = COLUMNS.findIndex(c => c.id === currentStatus);
    const nextStatus = COLUMNS[(currentIndex + 1) % COLUMNS.length].id;
    await updateTaskStatus(taskId, nextStatus);
    load();
  };

  const submit = async () => {
    if (!form.title) return;
await createTask({
  ...form,
  project: projectId || null,
  taskType: projectId ? "project" : "daily"
});
    setShowModal(false);
    load();
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Mobile Hint */}
      <p className="lg:hidden text-xs text-slate-400 text-center font-medium animate-pulse">
        Swipe horizontally to see all stages →
      </p>

      {/* --- KANBAN GRID --- */}
      <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 lg:overflow-visible snap-x custom-scrollbar">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[85vw] sm:min-w-[320px] lg:min-w-0 snap-center">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="ml-2 bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
            </div>

            {/* Task Container */}
            <div className="space-y-4 min-h-[500px] bg-slate-50/50 p-3 rounded-[2rem] border border-slate-100">
              {tasks.filter((t) => t.status === col.id).map((t) => (
                <TaskCard 
                  key={t._id} 
                  task={t} 
                  onStatusClick={() => handleStatusChange(t._id, t.status)} 
                />
              ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="py-12 text-center text-slate-300 text-xs italic">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD TASK BUTTON (FAB) --- */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 lg:px-6 lg:py-3 rounded-2xl shadow-2xl shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-90 group z-50"
      >
        <Plus size={24} />
        <span className="hidden lg:inline font-bold">New Task</span>
      </button>

      {/* --- MODAL --- */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Task">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">Title</label>
            <input
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="What needs to be done?"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Assignee</label>
              <select
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-3 rounded-xl outline-none appearance-none"
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="">Select User</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Priority</label>
              <select
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-3 rounded-xl outline-none"
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <button
            onClick={submit}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 mt-4"
          >
            Launch Task
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* --- SUB-COMPONENT: TASK CARD --- */

function TaskCard({ task, onStatusClick }) {
  const priorityMap = {
    high: "bg-red-50 text-red-600 border-red-100",
    medium: "bg-amber-50 text-amber-600 border-amber-100",
    low: "bg-slate-50 text-slate-500 border-slate-100"
  };

  return (
    <div className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter border ${priorityMap[task.priority] || priorityMap.medium}`}>
          {task.priority}
        </span>
        <button className="text-slate-300 hover:text-slate-600">
          <MoreVertical size={14} />
        </button>
      </div>

      <p className="font-bold text-slate-800 leading-tight mb-4">{task.title}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-white">
            {task.assignedTo?.name?.charAt(0) || "?"}
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            {task.assignedTo?.name.split(' ')[0] || "Unassigned"}
          </span>
        </div>

        <button 
          onClick={onStatusClick}
          className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group-hover:border-indigo-100 border border-transparent"
          title="Move to next stage"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}