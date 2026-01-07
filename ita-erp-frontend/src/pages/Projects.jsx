import { useEffect, useState } from "react";
import {
  fetchProjects,
  createProject,
  updateProject,
} from "../services/projectService";
import { fetchUsers } from "../services/userService";
import Modal from "../components/Modal";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [pRes, uRes] = await Promise.all([
      fetchProjects(),
      fetchUsers(),
    ]);
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

    if (editProject) {
      await updateProject(editProject._id, payload);
    } else {
      await createProject(payload);
    }

    setShowModal(false);
    setName("");
    setMembers([]);
    load();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={openAdd}
          className="bg-black text-white px-4 py-2 rounded-md text-sm"
        >
          + Add Project
        </button>
      </div>

      {/* Project List */}
      <div className="space-y-3">
        {projects.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-6">
            No projects found
          </div>
        )}

        {projects.map((p) => (
          <div
            key={p._id}
            className="border rounded-md p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {p.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Members:{" "}
                  {p.members.length
                    ? p.members.map((m) => m.name).join(", ")
                    : "No members"}
                </p>
              </div>

              <button
                onClick={() => openEdit(p)}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editProject ? "Edit Project" : "Add Project"}
      >
        <div className="space-y-3">

          <input
            className="border p-2 w-full rounded"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            multiple
            className="border p-2 w-full rounded h-40"
            value={members}
            onChange={(e) =>
              setMembers(
                [...e.target.selectedOptions].map((o) => o.value)
              )
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
            className="bg-black text-white w-full py-2 rounded"
          >
            {editProject ? "Update Project" : "Create Project"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
