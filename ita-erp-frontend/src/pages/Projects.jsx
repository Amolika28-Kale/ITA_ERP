import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects, createProject, updateProject } from "../services/projectService";
import { fetchUsers } from "../services/userService";
import { fetchTeams } from "../services/teamService";
import Modal from "../components/Modal";
import { 
  FolderPlus, Settings, Users as UsersIcon, 
  ChevronRight, Calendar, Target, MoreHorizontal 
} from "lucide-react";

const STATUS_CONFIG = {
  active: { color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", label: "Active" },
  "on-hold": { color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", label: "On Hold" },
  completed: { color: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50", label: "Completed" },
  archived: { color: "bg-slate-500", text: "text-slate-600", bg: "bg-slate-50", label: "Archived" }
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: "", team: "", members: [], status: "active" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [pRes, uRes, tRes] = await Promise.all([fetchProjects(), fetchUsers(), fetchTeams()]);
    setProjects(pRes.data);
    setUsers(uRes.data);
    setTeams(tRes.data);
  };

  const openAdd = () => {
    setEditProject(null);
    setForm({ name: "", team: "", members: [], status: "active" });
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      team: project.team?._id || "",
      members: project.members?.map((m) => m._id) || [],
      status: project.status || "active"
    });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.team) return;
    const payload = { ...form, team: form.team };
    if (editProject) await updateProject(editProject._id, payload);
    else await createProject(payload);
    setShowModal(false);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1">Track progress, manage teams, and hit your deadlines.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <FolderPlus size={20} />
          Launch Project
        </button>
      </div>

      {/* --- PROJECT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Target size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No projects found</h3>
            <p className="text-slate-400 mt-2">Get started by creating your first project.</p>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              className="group bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden"
            >
              {/* Decorative Gradient Top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${STATUS_CONFIG[p.status].bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[p.status].color}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[p.status].text}`}>
                    {STATUS_CONFIG[p.status].label}
                  </span>
                </div>
                <button onClick={() => openEdit(p)} className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {p.name}
              </h3>
              
              <div className="flex items-center gap-2 mt-2 text-slate-400">
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-indigo-500">
                  <UsersIcon size={12} />
                </div>
                <span className="text-xs font-medium">{p.team?.name || 'External'}</span>
              </div>

              {/* Progress Bar (Visual only for now) */}
              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Progress</span>
                  <span className="text-slate-600">65%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[65%] shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                </div>
              </div>

              {/* Members Avatar Stack */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex -space-x-3">
                  {p.members?.slice(0, 4).map((m, idx) => (
                    <div
                      key={m._id}
                      title={m.name}
                      className="h-10 w-10 rounded-xl bg-slate-800 border-4 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-slate-100 transition-transform hover:-translate-y-1 hover:z-10"
                      style={{ backgroundColor: `hsl(${idx * 45}, 70%, 45%)` }}
                    >
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {p.members?.length > 4 && (
                    <div className="h-10 w-10 rounded-xl bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>

                <Link
                  to={`/projects/${p._id}/tasks`}
                  className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 group/link transition-colors"
                >
                  View Tasks
                  <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODAL --- */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editProject ? "Project Settings" : "New Project"}>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Project Name</label>
            <input
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Q4 Marketing Campaign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Assigned Team</label>
              <select
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-2xl outline-none"
                value={form.team}
                onChange={(e) => setForm({ ...form, team: e.target.value })}
              >
                <option value="">Select...</option>
                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Current Status</label>
              <select
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-2xl outline-none"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Collaborators (Select Multiple)</label>
            <select
              multiple
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-3 rounded-2xl h-32 overflow-y-auto outline-none"
              value={form.members}
              onChange={(e) => setForm({ ...form, members: [...e.target.selectedOptions].map(o => o.value) })}
            >
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <p className="text-[10px] text-slate-400 italic mt-1">Hold Ctrl/Cmd to select multiple members.</p>
          </div>

          <button
            onClick={submit}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-[0.98]"
          >
            {editProject ? "Update Project" : "Initialize Project"}
          </button>
        </div>
      </Modal>
    </div>
  );
}