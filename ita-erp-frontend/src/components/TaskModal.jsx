import { useEffect, useState } from "react";
import { createTask, updateTask } from "../services/taskService";
import { fetchUsers } from "../services/userService";
import TaskComments from "./TaskComments";
import SubTasks from "./SubTasks";
import { 
  X, Calendar, User, AlignLeft, 
  Flag, MessageSquare, CheckSquare, Save, Check 
} from "lucide-react";

export default function TaskModal({ projectId, task, onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: [], 
    dueDate: "",
  });

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      // जर बॅकएंडवरून डेटा populated आला असेल तर ID काढा
      assignedTo: task.assignedTo ? task.assignedTo.map(u => typeof u === 'object' ? u._id : u) : [],
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
    });
  }, [task]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers();
        setUsers(res.data || []);
      } catch (err) { console.error(err); }
    };
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleUser = (userId) => {
    setForm(prev => {
      const isSelected = prev.assignedTo.includes(userId);
      return {
        ...prev,
        assignedTo: isSelected 
          ? prev.assignedTo.filter(id => id !== userId) 
          : [...prev.assignedTo, userId]
      };
    });
  };

  const submit = async () => {
    if (saving || !form.title.trim()) return;
    try {
      setSaving(true);
      const payload = {
        ...form,
        project: projectId || null,
        taskType: projectId ? "project" : "daily"
      };

      // API Call
      const res = await (task ? updateTask(task._id, payload) : createTask(payload));
      
      onSaved?.();
      onClose?.();
    } catch (err) { 
        console.error("Submission Error:", err);
        // जर बॅकएंडवर नोटिफिकेशन फेल झालं असेल तरी टास्क सेव्ह झाला असू शकतो
        alert("Task process encountered an issue. Check console for details."); 
    } 
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className={`
        bg-white w-full transition-all duration-300 ease-out
        ${task ? 'max-w-3xl' : 'max-w-xl'} 
        h-[95vh] sm:h-auto sm:max-h-[90vh] 
        rounded-t-[2rem] sm:rounded-[2.5rem] 
        flex flex-col shadow-2xl overflow-hidden
      `}>
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {task ? "Task Workspace" : "New Task"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full text-xl font-bold p-5 bg-slate-50 border-none ring-1 ring-slate-200 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Team Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User size={14}/> Assign Team Members
              </label>
              <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 ring-1 ring-slate-200 rounded-[1.25rem] min-h-[80px]">
                {users.map((u) => {
                  const isSelected = form.assignedTo.includes(u._id);
                  return (
                    <button key={u._id} type="button" onClick={() => toggleUser(u._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border
                        ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                      {u.name} {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-[1.25rem] outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-[1.25rem] outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-4 sticky bottom-0">
          <button onClick={onClose} className="px-8 py-4 text-sm font-black text-slate-400">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-10 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black shadow-xl shadow-indigo-200 active:scale-95 transition-all">
            {saving ? "Syncing..." : task ? "Update Task" : "Launch Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-6 py-5 text-sm font-black border-b-[3px] transition-all
        ${active ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-400'} `}>
      {icon} {label}
    </button>
  );
}