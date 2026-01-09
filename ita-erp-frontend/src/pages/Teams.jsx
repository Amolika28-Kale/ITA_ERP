import { useEffect, useState } from "react";
import { fetchTeams, createTeam, updateTeam } from "../services/teamService";
import Modal from "../components/Modal";
import { Users, Plus, Edit3, Briefcase, Loader2 } from "lucide-react";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await fetchTeams();
      setTeams(res.data);
    } catch (err) {
      setError("Failed to load teams");
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
      editTeam
        ? await updateTeam(editTeam._id, payload)
        : await createTeam(payload);

      setShowModal(false);
      loadTeams();
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-sm text-gray-500">
            Organize users into structured departments
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow"
        >
          <Plus size={18} />
          New Team
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Teams Grid */}
      {!loading && teams.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-3xl p-12 text-center">
          <Briefcase size={36} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">No teams created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div
              key={t._id}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                  {t.name.charAt(0)}
                </div>
                <button
                  onClick={() => openEdit(t)}
                  className="p-2 text-gray-400 hover:text-indigo-600"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              <h3 className="text-lg font-bold mt-4">{t.name}</h3>

              {t.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {t.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
                <Users size={14} />
                Department Team
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editTeam ? "Edit Team" : "Create Team"}
      >
        <div className="space-y-4">
          <input
            className="w-full border p-3 rounded-xl bg-gray-50"
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="w-full border p-3 rounded-xl bg-gray-50"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <button
            onClick={submit}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold"
          >
            {editTeam ? "Save Changes" : "Create Team"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
