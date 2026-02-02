import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskDetails, updateTask } from "../services/taskService"; // Ensure updateTask is in services
import { fetchUsers } from "../services/userService";
import { 
  ArrowLeft, UserPlus, Calendar, Flag, 
  AlignLeft, Save, Check, RefreshCcw 
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: [],
    dueDate: "",
    isRecurring: false,
    frequency: "none"
  });

  useEffect(() => {
    const initData = async () => {
      try {
        setFetching(true);
        // 1. Fetch all users for the dropdown
        const usersRes = await fetchUsers();
        setUsers(usersRes.data || []);

        // 2. Fetch specific task details
        const taskRes = await getTaskDetails(id);
        const task = taskRes.data;

        // 3. Pre-fill the form
        setForm({
          title: task.title,
          description: task.description || "",
          priority: task.priority,
          assignedTo: task.assignedTo.map(u => u._id || u), // Map to IDs only
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
          isRecurring: task.isRecurring || false,
          frequency: task.frequency || "none"
        });
      } catch (err) {
        toast.error("Failed to load task data");
        navigate("/all-tasks");
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleUser = (userId) => {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateTask(id, form);
      toast.success("Task updated successfully! 🔄");
      navigate("/all-tasks");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center animate-pulse font-black text-slate-300">FETCHING TASK DATA...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="bg-white border-2 border-slate-50 rounded-[3rem] shadow-2xl shadow-indigo-500/5 overflow-hidden">
        <div className="h-2 w-full bg-amber-400" /> {/* Different color for Edit mode */}
        
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Edit <span className="text-indigo-600">Task Details</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Modify assignment for UID: #{id.slice(-6)}</p>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
              <input name="title" required value={form.title} onChange={handleChange} className="w-full text-lg font-bold p-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none" />
            </div>

            {/* Recurring Logic */}
            <div className="flex items-center gap-4 p-5 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100">
              <div className="flex-1">
                <label className="text-[10px] font-black text-indigo-600 uppercase block mb-1">Update Frequency</label>
                <select name="frequency" className="bg-transparent font-bold text-sm outline-none" value={form.frequency} onChange={handleChange}>
                  <option value="none">One Time Only</option>
                  <option value="daily">Daily Task</option>
                  <option value="weekly">Weekly Task</option>
                  <option value="monthly">Monthly Task</option>
                </select>
              </div>
              <RefreshCcw className={`text-indigo-400 ${form.frequency !== 'none' ? 'animate-spin-slow' : ''}`} size={20} />
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><UserPlus size={14} /> Re-assign Members</label>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto">
                {users.map((u) => (
                  <button key={u._id} type="button" onClick={() => toggleUser(u._id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${form.assignedTo.includes(u._id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100'}`}>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Flag size={14} /> Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold text-xs">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Calendar size={14} /> New Deadline</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold text-xs" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><AlignLeft size={14} /> Description</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none resize-none" />
            </div>
          </div>

          <button disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
            {loading ? "Updating..." : "Save Changes"} <Save size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}