import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../services/taskService";
import { fetchUsers } from "../services/userService";
import { 
  ArrowLeft, UserPlus, Calendar, Flag, 
  AlignLeft, Save, X, Check 
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreateTask() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: [],
    dueDate: "",
  });

  // एम्प्लॉयी लिस्ट लोड करा
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers();
        setUsers(res.data || []);
      } catch (err) {
        toast.error("Could not load team members");
      }
    };
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Multiple Users सिलेक्ट/डीसिलेक्ट करण्यासाठी
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Task title is required");
    if (form.assignedTo.length === 0) return toast.error("Please assign at least one member");

    try {
      setLoading(true);
      await createTask(form);
      toast.success("Task assigned successfully! 🚀");
      navigate("/all-tasks"); // मास्टर लेजरवर परत जा
    } catch (err) {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* --- BACK NAV --- */}
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Cancel Assignment
      </button>

      <div className="bg-white border-2 border-slate-50 rounded-[3rem] shadow-2xl shadow-indigo-500/5 overflow-hidden">
        <div className="h-2 w-full bg-indigo-600" />
        
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
              New <span className="text-indigo-600">Assignment</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Assign work to your team members</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* TASK TITLE */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Complete the financial audit..."
                className="w-full text-xl font-bold p-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none shadow-inner"
              />
            </div>

            {/* ASSIGN MEMBERS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserPlus size={14} /> Select Assignees
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                {users.map((u) => {
                  const isSelected = form.assignedTo.includes(u._id);
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => toggleUser(u._id)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-black uppercase transition-all border
                        ${isSelected 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-300'
                        }`}
                    >
                      <span className="truncate">{u.name}</span>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRIORITY & DUE DATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Flag size={14} /> Priority Level
                </label>
                <select 
                  name="priority" 
                  value={form.priority} 
                  onChange={handleChange} 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={14} /> Deadline
                </label>
                <input 
                  type="date" 
                  name="dueDate" 
                  value={form.dueDate} 
                  onChange={handleChange} 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10" 
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <AlignLeft size={14} /> Description / Instructions
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what needs to be done in detail..."
                className="w-full p-6 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none resize-none shadow-inner"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto px-12 py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Lock in Assignment"}
              <Save size={18} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}