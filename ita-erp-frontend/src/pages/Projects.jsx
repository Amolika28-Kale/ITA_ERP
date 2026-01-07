import { useEffect, useState } from "react";
import { fetchProjects, createProject, updateProject } from "../services/projectService";
import { fetchUsers } from "../services/userService";
import Modal from "../components/Modal";
import { FolderPlus, Settings, Users as UsersIcon, CheckCircle2 } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [pRes, uRes] = await Promise.all([fetchProjects(), fetchUsers()]);
    setProjects(pRes.data);
    setUsers(uRes.data);
  };

  const openAdd = () => {
    setEditProject(null);
    setName("");
    setMembers([]);
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setName(project.name);
    setMembers(project.members.map((m) => m._id));
    setShowModal(true);
  };

  const submit = async () => {
    if (!name.trim()) return;
    const payload = { name, members };
    editProject ? await updateProject(editProject._id, payload) : await createProject(payload);
    setShowModal(false);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500">Track and manage active team initiatives.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm"
        >
          <FolderPlus size={18} />
          New Project
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed">
            <p className="text-gray-400">No projects found. Create one to get started.</p>
          </div>
        ) : (
          projects.map((p) => (
            <div key={p._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 size={14} /> Active
                  </div>
                </div>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Settings size={18} />
                </button>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Project Members</p>
                <div className="flex -space-x-2 overflow-hidden">
                  {p.members.length > 0 ? (
                    p.members.map((m, i) => (
                      <div 
                        key={i} 
                        title={m.name}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border border-indigo-200"
                      >
                        {m.name.charAt(0)}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">No members assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editProject ? "Project Settings" : "Launch Project"}>
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Project Name</label>
            <input
              className="w-full border-gray-200 p-3 bg-gray-50 rounded-xl outline-none border focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Q4 Marketing Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Assign Members (Hold Ctrl to select multiple)</label>
            <select
              multiple
              className="w-full border-gray-200 p-2 bg-gray-50 rounded-xl outline-none border h-40 focus:ring-2 focus:ring-indigo-500 transition-all"
              value={members}
              onChange={(e) => setMembers([...e.target.selectedOptions].map((o) => o.value))}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id} className="p-2 rounded-lg m-1 checked:bg-indigo-600 checked:text-white">
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={submit}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
          >
            {editProject ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </Modal>
    </div>
  );
}