import { useEffect, useState } from "react";
import { fetchTeams, createTeam } from "../services/teamService";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => { load(); }, []);
  const load = async () => setTeams((await fetchTeams()).data);

  const submit = async () => {
    await createTeam({ name });
    setName("");
    load();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Teams</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded w-64"
          placeholder="Team name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={submit} className="bg-black text-white px-4 rounded">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {teams.map(t => (
          <li key={t._id} className="border p-3 rounded">
            {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
