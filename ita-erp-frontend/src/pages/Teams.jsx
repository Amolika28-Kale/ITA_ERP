import { useEffect, useState } from "react";
import { 
  fetchTeams, 
  createTeam, 
  updateTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  getAvailableEmployees 
} from "../services/teamService";
import Modal from "../components/Modal";
import { 
  Users, Plus, Edit3, Briefcase, Loader2, 
  ArrowRight, Info, LayoutGrid, UserPlus,
  UserMinus, Mail, ChevronRight, X,
  Search, Shield, UserCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Member management state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await fetchTeams();
      setTeams(res.data);
    } catch (err) {
      setError("Failed to synchronize departments.");
      toast.error("Failed to load teams");
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

const openMembersModal = async (team) => {
  console.log("Opening members modal for team:", team);
  console.log("Team ID:", team._id);
  
  setSelectedTeam(team);
  setShowMembersModal(true);
  
  // Make sure we have a valid ID
  if (team && team._id) {
    await loadAvailableEmployees(team._id);
  } else {
    toast.error("Invalid team ID");
  }
};
const loadAvailableEmployees = async (teamId) => {
  console.log("Loading available employees for team ID:", teamId);
  
  if (!teamId) {
    console.error("No team ID provided");
    toast.error("Cannot load employees: Missing team ID");
    return;
  }

  try {
    setLoadingEmployees(true);
    console.log("Making API call to:", `/teams/${teamId}/available-employees`);
    
    const res = await getAvailableEmployees(teamId);
    console.log("API Response:", res);
    
    setAvailableEmployees(res.data);
  } catch (err) {
    console.error("Full error object:", err);
    console.error("Error response:", err.response);
    console.error("Error status:", err.response?.status);
    console.error("Error data:", err.response?.data);
    
    if (err.response?.status === 404) {
      toast.error("The available employees endpoint was not found. Please check your backend routes.");
    } else if (err.response?.status === 401) {
      toast.error("You are not authorized. Please login again.");
    } else if (err.response?.status === 403) {
      toast.error("You don't have permission to view this.");
    } else {
      toast.error(err.response?.data?.message || "Failed to load available employees");
    }
  } finally {
    setLoadingEmployees(false);
  }
};

const handleAddMember = async (userId) => {
  console.log("Adding member:", userId, "to team:", selectedTeam._id);
  
  try {
    setLoadingEmployees(true); // Show loading state
    
    const response = await addMemberToTeam(selectedTeam._id, userId);
    console.log("Add member response:", response);
    
    toast.success("Member added successfully");
    
    // Refresh team data to get updated members list
    const teamsRes = await fetchTeams();
    setTeams(teamsRes.data);
    
    // Update selected team with new data
    const updatedTeam = teamsRes.data.find(t => t._id === selectedTeam._id);
    setSelectedTeam(updatedTeam);
    
    // Refresh available employees list
    await loadAvailableEmployees(selectedTeam._id);
    
  } catch (err) {
    console.error("Error adding member:", err);
    console.error("Error response:", err.response);
    
    const errorMessage = err.response?.data?.message || "Failed to add member";
    toast.error(errorMessage);
  } finally {
    setLoadingEmployees(false);
  }
};
  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await removeMemberFromTeam(selectedTeam._id, userId);
      toast.success("Member removed successfully");
      
      // Refresh team data
      const res = await fetchTeams();
      setTeams(res.data);
      
      // Update selected team with new data
      const updatedTeam = res.data.find(t => t._id === selectedTeam._id);
      setSelectedTeam(updatedTeam);
      
      // Refresh available employees
      await loadAvailableEmployees(selectedTeam._id);
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }
    
    const payload = { name, description };
    try {
      if (editTeam) {
        await updateTeam(editTeam._id, payload);
        toast.success("Department updated successfully");
      } else {
        await createTeam(payload);
        toast.success("Department created successfully");
      }
      setShowModal(false);
      loadTeams();
    } catch {
      toast.error("Error saving department data.");
    }
  };

  // Filter employees based on search
  const filteredEmployees = availableEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2rem] p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Department <span className="text-indigo-300">Management</span>
            </h1>
            <p className="text-indigo-200/70 text-sm font-medium mt-1 flex items-center gap-2">
              <Briefcase size={14} />
              Organize employees into collaborative units • {teams.length} Departments
            </p>
          </div>

          <button
            onClick={openAdd}
            className="bg-white text-slate-900 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={18} />
            New Department
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <TeamSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-medium">
          <Info size={20} /> {error}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-24 text-center">
          <Briefcase size={48} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-bold text-slate-800">No Departments Found</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-2">Create your first department to start organizing employees.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, idx) => (
            <TeamCard 
              key={team._id} 
              team={team} 
              index={idx} 
              onEdit={() => openEdit(team)}
              onManageMembers={() => openMembersModal(team)}
            />
          ))}
        </div>
      )}

   {/* Create/Edit Team Modal - WITH FOOTER */}
<Modal 
  open={showModal} 
  onClose={() => setShowModal(false)} 
  title={editTeam ? "Edit Department" : "New Department"}
  showFooter={true}
  primaryText={editTeam ? "Update Department" : "Create Department"}
  onPrimary={submit}
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
  </div>
</Modal>

   {/* Members Management Modal - WITHOUT FOOTER */}
<Modal 
  open={showMembersModal} 
  onClose={() => {
    setShowMembersModal(false);
    setSelectedTeam(null);
    setSearchTerm("");
  }}
  title={`Manage Members - ${selectedTeam?.name}`}
  size="lg"
  showFooter={false} // Add this to hide the footer
>
  {selectedTeam && (
    <div className="space-y-6">
      {/* Current Members */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Users size={16} className="text-indigo-500" />
          Current Members ({selectedTeam.members?.length || 0})
        </h3>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {/* Team Leader */}
          {selectedTeam.leader && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {selectedTeam.leader.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {selectedTeam.leader.name}
                    <span className="text-[8px] font-black bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                      LEADER
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">{selectedTeam.leader.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Members */}
          {selectedTeam.members?.map(member => (
            <div key={member._id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {member.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveMember(member._id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Remove member"
              >
                <UserMinus size={16} />
              </button>
            </div>
          ))}

          {(!selectedTeam.members || selectedTeam.members.length === 0) && !selectedTeam.leader && (
            <p className="text-center text-sm text-slate-400 py-4">No members in this department</p>
          )}
        </div>
      </div>

      {/* Add New Members */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <UserPlus size={16} className="text-indigo-500" />
          Add Members
        </h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Available Employees List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {loadingEmployees ? (
            <div className="flex justify-center py-4">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map(emp => (
              <div key={emp._id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-400 text-white rounded-lg flex items-center justify-center font-bold">
                    {emp.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddMember(emp._id)}
                  className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Add to department"
                >
                  <UserPlus size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-400 py-4">
              {searchTerm ? "No employees match your search" : "No available employees to add"}
            </p>
          )}
        </div>
      </div>
    </div>
  )}
</Modal>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function TeamCard({ team, onEdit, onManageMembers, index }) {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-violet-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600"
  ];
  const selectedGradient = gradients[index % gradients.length];

  const memberCount = team.members?.length || 0;
  const totalEmployees = memberCount + (team.leader ? 1 : 0);

  return (
    <div className="group bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${selectedGradient} text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-500`}>
            {team.name.charAt(0)}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onManageMembers}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Manage Members"
            >
              <Users size={16} />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Edit Department"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">{team.name}</h3>
        
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[32px] mb-4">
          {team.description || "No description provided"}
        </p>

        {/* Team Leader */}
        {team.leader && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-amber-50 rounded-lg">
            <div className="w-6 h-6 bg-amber-600 text-white rounded-md flex items-center justify-center text-xs font-bold">
              {team.leader.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700">{team.leader.name}</p>
              <p className="text-[8px] text-amber-600 font-bold uppercase">Team Leader</p>
            </div>
          </div>
        )}

        {/* Members Preview */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {team.members?.slice(0, 3).map((member, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-600"
                >
                  {member.name?.charAt(0)}
                </div>
              ))}
              {team.members?.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                  +{team.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-slate-600">
              {totalEmployees} {totalEmployees === 1 ? 'member' : 'members'}
            </span>
          </div>
          
          <button
            onClick={onManageMembers}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Manage <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="bg-slate-100/50 border border-slate-100 rounded-[2rem] p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
        <div className="w-16 h-8 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 rounded-md mb-2" />
      <div className="h-4 w-full bg-slate-200 rounded-md mb-1" />
      <div className="h-4 w-2/3 bg-slate-200 rounded-md mb-4" />
      <div className="h-10 w-full bg-slate-200 rounded-lg" />
    </div>
  );
}