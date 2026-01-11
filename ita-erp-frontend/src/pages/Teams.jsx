import { useEffect, useState } from "react";
import { fetchTeams, createTeam, updateTeam } from "../services/teamService";
import Modal from "../components/Modal";
import { 
  Users, Plus, Edit3, Briefcase, Loader2, 
  ArrowRight, Info, LayoutGrid 
} from "lucide-react";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await fetchTeams();
      setTeams(res.data);
    } catch (err) {
      setError("Failed to synchronize departments.");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditTeam(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditTeam(team);
    setName(team.name);
    setDescription(team.description || "");
    setShowModal(true);
  };

  const submit = async () => {
    if (!name.trim()) return;
    const payload = { name, description };
    try {
      editTeam ? await updateTeam(editTeam._id, payload) : await createTeam(payload);
      setShowModal(false);
      loadTeams();
    } catch {
      alert("Error saving department data.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Departments</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Structure your organization into collaborative units.
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus size={20} />
          New Department
        </button>
      </div>

      {/* --- CONTENT STATE --- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <TeamSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-medium">
          <Info size={20} /> {error}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-24 text-center">
          <Briefcase size={48} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-bold text-slate-800">No Departments Found</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-2">Create your first team to start assigning projects and members.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t, idx) => (
            <TeamCard key={t._id} team={t} index={idx} onEdit={() => openEdit(t)} />
          ))}
        </div>
      )}

      {/* --- MODAL --- */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={editTeam ? "Edit Department" : "New Department"}
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Department Name</label>
            <input
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g., Engineering, Marketing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Description</label>
            <textarea
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="What does this team focus on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <button
            onClick={submit}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            {editTeam ? "Save Department" : "Create Department"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function TeamCard({ team, onEdit, index }) {
  // Array of soft gradients for variety
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-violet-600",
    "from-amber-500 to-orange-600"
  ];
  const selectedGradient = gradients[index % gradients.length];

  return (
    <div className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 bg-gradient-to-br ${selectedGradient} text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500`}>
          {team.name.charAt(0)}
        </div>
        <button
          onClick={onEdit}
          className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <Edit3 size={18} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">{team.name}</h3>
      
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[40px]">
        {team.description || "Organizing collaborative efforts and specialized task management for this sector."}
      </p>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Users size={14} className="text-indigo-500" />
          Core Unit
        </div>
        <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-300 w-1/2 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="bg-slate-100/50 border border-slate-100 rounded-[2.5rem] p-8 animate-pulse">
      <div className="w-14 h-14 bg-slate-200 rounded-2xl mb-6" />
      <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-3" />
      <div className="h-4 w-full bg-slate-200 rounded-md mb-2" />
      <div className="h-4 w-2/3 bg-slate-200 rounded-md" />
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
        <div className="h-4 w-20 bg-slate-200 rounded-md" />
        <div className="h-4 w-12 bg-slate-200 rounded-md" />
      </div>
    </div>
  );
}