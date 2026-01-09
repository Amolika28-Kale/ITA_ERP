import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchProjects,
  createProject,
  updateProject
} from "../services/projectService";
import { fetchUsers } from "../services/userService";
import { fetchTeams } from "../services/teamService";
import Modal from "../components/Modal";
import {
  FolderPlus,
  Settings,
  Users as UsersIcon
} from "lucide-react";

/* ================= STATUS STYLES ================= */
const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700",
  "on-hold": "bg-amber-100 text-amber-700",
  completed: "bg-gray-200 text-gray-700",
  archived: "bg-red-100 text-red-700"
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const [form, setForm] = useState({
    name: "",
    team: "",
    members: [],
    status: "active"
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pRes, uRes, tRes] = await Promise.all([
      fetchProjects(),
      fetchUsers(),
      fetchTeams()
    ]);

    setProjects(pRes.data);
    setUsers(uRes.data);
    setTeams(tRes.data);
  };

  /* ================= MODAL HANDLERS ================= */
  const openAdd = () => {
    setEditProject(null);
    setForm({
      name: "",
      team: "",
      members: [],
      status: "active"
    });
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

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!form.name.trim() || !form.team) return;

    const payload = {
      name: form.name,
      team: form.team,
      members: form.members,
      status: form.status
    };

    if (editProject) {
      await updateProject(editProject._id, payload);
    } else {
      await createProject(payload);
    }

    setShowModal(false);
    loadData();
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow border">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-sm text-gray-500">
            Manage projects & team members
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700"
        >
          <FolderPlus size={18} />
          New Project
        </button>
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed">
            <p className="text-gray-400">No projects created yet</p>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition relative"
            >
              <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600 rounded-l-2xl" />

              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{p.name}</h3>

                  <span
                    className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status]}`}
                  >
                    {p.status}
                  </span>

                  {p.team && (
                    <p className="text-xs text-gray-500 mt-2">
                      Team:{" "}
                      <span className="font-semibold">{p.team.name}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => openEdit(p)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Settings size={18} />
                </button>
              </div>

              {/* MEMBERS */}
              <div className="mt-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <UsersIcon size={14} /> Members
                </p>

                <div className="flex -space-x-2">
                  {p.members?.length > 0 ? (
                    p.members.map((m) => (
                      <div
                        key={m._id}
                        title={m.name}
                        className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold ring-2 ring-white"
                      >
                        {m.name.charAt(0)}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      No members
                    </span>
                  )}
                </div>
              </div>

              {/* ACTION */}
              <div className="mt-6 flex justify-end">
                <Link
                  to={`/projects/${p._id}/tasks`}
                  className="px-4 py-2 text-sm font-semibold rounded-lg
                             bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  View Tasks →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editProject ? "Edit Project" : "Create Project"}
      >
        <div className="space-y-4">
          <input
            className="w-full border p-3 rounded-xl bg-gray-50"
            placeholder="Project Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          {/* TEAM */}
          <select
            className="w-full border p-3 rounded-xl bg-gray-50"
            value={form.team}
            onChange={(e) =>
              setForm({ ...form, team: e.target.value })
            }
          >
            <option value="">Select Team *</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* STATUS */}
          <select
            className="w-full border p-3 rounded-xl bg-gray-50"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          {/* MEMBERS */}
          <select
            multiple
            className="w-full border p-3 rounded-xl bg-gray-50 h-40"
            value={form.members}
            onChange={(e) =>
              setForm({
                ...form,
                members: [...e.target.selectedOptions].map(
                  (o) => o.value
                )
              })
            }
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={submit}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700"
          >
            {editProject ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
