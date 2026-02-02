import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../services/taskService";
import { fetchUsers } from "../services/userService";
import { 
  ArrowLeft, UserPlus, Calendar, Flag, 
  AlignLeft, Save, Check, RefreshCcw, Briefcase
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreateTask() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    workshopName: "", // Requirement: Workshop Name use instead of company
    description: "",
    priority: "medium",
    assignedTo: [],
    dueDate: "",
    isRecurring: false,
    frequency: "none"
  });

  // Load Team Members
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
      // Logic: If frequency is daily, backend will set taskType to 'daily'
      await createTask(form);
      toast.success("Assignment Locked & Notified! 🚀");
      navigate("/all-tasks");
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
        Discard Assignment
      </button>

      <div className="bg-white border-2 border-slate-50 rounded-[3.5rem] shadow-2xl shadow-indigo-500/5 overflow-hidden">
        <div className="h-2 w-full bg-indigo-600" />
        
        <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-10">
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
              Create <span className="text-indigo-600">Assignment</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Master Ledger Input</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* WORKSHOP NAME & TASK TITLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Briefcase size={14} /> Workshop Name
                </label>
                <input
                  name="workshopName"
                  value={form.workshopName}
                  onChange={handleChange}
                  placeholder="Workshop Identity..."
                  className="w-full font-bold p-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  className="w-full font-bold p-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            {/* RECURRING TASK TOGGLE */}
            <div className="flex flex-col md:flex-row items-center gap-4 p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-black text-indigo-900 uppercase">Set as Recurring Task?</h4>
                <p className="text-[10px] text-indigo-400 font-bold uppercase">This assignment will auto-renew based on frequency</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  name="frequency" 
                  className="bg-white border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase text-indigo-600 outline-none shadow-sm"
                  value={form.frequency}
                  onChange={(e) => setForm({...form, frequency: e.target.value, isRecurring: e.target.value !== 'none'})}
                >
                  <option value="none">One Time</option>
                  <option value="daily">Daily Reset</option>
                  <option value="weekly">Weekly Reset</option>
                  <option value="monthly">Monthly Reset</option>
                </select>
                <div className={`p-3 rounded-full transition-all ${form.isRecurring ? 'bg-indigo-600 text-white animate-spin-slow' : 'bg-slate-200 text-slate-400'}`}>
                  <RefreshCcw size={18} />
                </div>
              </div>
            </div>

            {/* ASSIGN MEMBERS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserPlus size={14} /> Team Selection
              </label>
              <div className="flex flex-wrap gap-2 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 max-h-40 overflow-y-auto">
                {users.map((u) => {
                  const isSelected = form.assignedTo.includes(u._id);
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => toggleUser(u._id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border
                        ${isSelected 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-300'
                        }`}
                    >
                      {u.name}
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRIORITY & DUE DATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Flag size={14} /> Urgency Level
                </label>
                <select 
                  name="priority" 
                  value={form.priority} 
                  onChange={handleChange} 
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={14} /> Initial Deadline
                </label>
                <input 
                  type="date" 
                  name="dueDate" 
                  value={form.dueDate} 
                  onChange={handleChange} 
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10" 
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <AlignLeft size={14} /> Assignment Brief
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Details for the team..."
                className="w-full p-6 bg-slate-50 border-none rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-6 border-t border-slate-50">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto px-16 py-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Initialize Task"}
              <Save size={20} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}