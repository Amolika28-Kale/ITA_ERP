import { useEffect, useState } from "react";
import { fetchProjects, createProject } from "../services/projectService";
import { fetchUsers } from "../services/userService";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setProjects((await fetchProjects()).data);
    setUsers((await fetchUsers()).data);
  };

  const submit = async () => {
    await createProject({ name, members });
    setName("");
    setMembers([]);
    load();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>

      <input
        className="border p-2 rounded w-full mb-2"
        placeholder="Project name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <select
        multiple
        className="border p-2 rounded w-full mb-2"
        onChange={e =>
          setMembers([...e.target.selectedOptions].map(o => o.value))
        }
      >
        {users.map(u => (
          <option key={u._id} value={u._id}>{u.name}</option>
        ))}
      </select>

      <button onClick={submit} className="bg-black text-white px-4 py-2 rounded">
        Create Project
      </button>

      <div className="mt-6 space-y-3">
        {projects.map(p => (
          <div key={p._id} className="border p-4 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-500">
              Members: {p.members.map(m => m.name).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
