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
    assignedTo: [], // आता हा Array आहे
    dueDate: "",
  });

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      // जर बॅकएंडवरून डेटा ऑब्जेक्ट स्वरूपात असेल तर फक्त ID काढा
      assignedTo: task.assignedTo ? task.assignedTo.map(u => u._id || u) : [],
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

  // ✅ Multiple Users सिलेक्ट किंवा रिमूव्ह करण्यासाठी फंक्शन
  const toggleUser = (userId) => {
    setForm(prev => {
      const isSelected = prev.assignedTo.includes(userId);
      return {
        ...prev,
        assignedTo: isSelected 
          ? prev.assignedTo.filter(id => id !== userId) // आधीच असेल तर काढून टाका
          : [...prev.assignedTo, userId]               // नसेल तर ॲड करा
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
      task ? await updateTask(task._id, payload) : await createTask(payload);
      onSaved?.();
      onClose?.();
    } catch (err) { alert("Failed to save task"); } 
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in">
      
      <div className={`
        bg-white w-full transition-all duration-300 ease-out
        ${task ? 'max-w-2xl' : 'max-w-lg'} 
        h-[95vh] sm:h-auto sm:max-h-[90vh] 
        rounded-t-[2rem] sm:rounded-[2rem] 
        flex flex-col shadow-2xl overflow-hidden
      `}>
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {task ? "Task Workspace" : "New Task"}
            </h2>
            {task && <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">ID: {task._id.slice(-6)}</span>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        {task && (
          <div className="flex px-6 border-b border-slate-50 bg-slate-50/30">
            <TabBtn active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<AlignLeft size={16}/>} label="Details" />
            <TabBtn active={activeTab === 'subtasks'} onClick={() => setActiveTab('subtasks')} icon={<CheckSquare size={16}/>} label="Checklist" />
            <TabBtn active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<MessageSquare size={16}/>} label="Activity" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {activeTab === 'details' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  className="w-full text-lg font-bold p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              {/* ✅ MULTIPLE ASSIGNEES SECTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                  <User size={14}/> Assign Team Members
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 ring-1 ring-slate-200 rounded-2xl max-h-40 overflow-y-auto custom-scrollbar">
                  {users.map((u) => {
                    const isSelected = form.assignedTo.includes(u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => toggleUser(u._id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition-all border
                          ${isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                            : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-300'
                          }`}
                      >
                        <span className="truncate pr-1">{u.name}</span>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                    <Flag size={14}/> Priority
                  </label>
                  <select name="priority" value={form.priority} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                    <Calendar size={14}/> Due Date
                  </label>
                  <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Notes</label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add more details about this task..."
                  className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'subtasks' && task && (
            <div className="animate-in slide-in-from-right-4 duration-300 h-full">
              <SubTasks task={task} />
            </div>
          )}

          {activeTab === 'activity' && task && (
            <div className="animate-in slide-in-from-right-4 duration-300 h-full">
              <TaskComments taskId={task._id} />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0">
          <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">
            Discard
          </button>
          <button 
            onClick={submit} 
            disabled={saving} 
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all"
          >
            {saving ? "Syncing..." : task ? "Update Task" : "Create Task"}
            {!saving && <Save size={18}/>}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all
        ${active ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}