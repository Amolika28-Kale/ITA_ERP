import { useEffect, useState } from "react";
import { fetchTeams, createTeam, updateTeam } from "../services/teamService";
import Modal from "../components/Modal";
import { Users, Plus, Edit3, Briefcase } from "lucide-react"; // Optional icons

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
    editTeam ? await updateTeam(editTeam._id, { name }) : await createTeam({ name });
    setShowModal(false);
    setName("");
    loadTeams();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-sm text-gray-500 italic">Organize and manage your departmental groups.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-md shadow-indigo-100"
        >
          <Plus size={18} />
          New Team
        </button>
      </div>

      {/* Team Grid */}
      {teams.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-400 font-medium">No teams created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div 
              key={t._id} 
              className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => openEdit(t)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{t.name}</h3>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
                <Users size={14} />
                <span>Default Department</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editTeam ? "Edit Team Details" : "Create New Team"}
      >
        <div className="space-y-5 p-1">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
              Team Identity
            </label>
            <input
              className="w-full border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-gray-50 rounded-xl transition-all outline-none border text-gray-800"
              placeholder="e.g. Engineering, Marketing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <button
            onClick={submit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-100 mt-2"
          >
            {editTeam ? "Save Updates" : "Confirm Team Creation"}
          </button>
        </div>
      </Modal>
    </div>
  );
}