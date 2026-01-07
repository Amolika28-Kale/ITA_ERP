import { useEffect, useState } from "react";
import { fetchTeams, createTeam, updateTeam } from "../services/teamService";
import Modal from "../components/Modal";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const res = await fetchTeams();
    setTeams(res.data);
  };

  const openAdd = () => {
    setEditTeam(null);
    setName("");
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditTeam(team);
    setName(team.name);
    setShowModal(true);
  };

  const submit = async () => {
    if (!name.trim()) return;

    if (editTeam) {
      await updateTeam(editTeam._id, { name });
    } else {
      await createTeam({ name });
    }

    setShowModal(false);
    setName("");
    loadTeams();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teams</h2>
        <button
          onClick={openAdd}
          className="bg-black text-white px-4 py-2 rounded-md text-sm"
        >
          + Add Team
        </button>
      </div>

      {/* Team List */}
      <ul className="space-y-2">
        {teams.length === 0 && (
          <li className="text-gray-400 text-sm text-center py-6">
            No teams found
          </li>
        )}

        {teams.map((t) => (
          <li
            key={t._id}
            className="border rounded-md p-3 flex justify-between items-center hover:bg-gray-50"
          >
            <span className="font-medium text-gray-800">{t.name}</span>
            <button
              onClick={() => openEdit(t)}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editTeam ? "Edit Team" : "Add Team"}
      >
        <div className="space-y-3">
          <input
            className="border p-2 w-full rounded"
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={submit}
            className="bg-black text-white w-full py-2 rounded"
          >
            {editTeam ? "Update Team" : "Create Team"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
