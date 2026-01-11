import { useEffect, useState } from "react";
import { fetchUsers, createUser, updateUser } from "../services/userService";
import { fetchTeams } from "../services/teamService";
import Modal from "../components/Modal";
import { 
  UserPlus, Edit2, Shield, Mail, Users as TeamIcon, 
  Search, MoreVertical, CheckCircle2 
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({ name: "", email: "", role: "employee", teamId: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [uRes, tRes] = await Promise.all([fetchUsers(), fetchTeams()]);
    setUsers(uRes.data);
    setTeams(tRes.data);
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", role: "employee", teamId: "" });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, teamId: user.teamId?._id || "" });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.name || !form.email) return;
    const payload = { name: form.name, role: form.role, teamId: form.teamId || null };
    
    if (!editUser) {
      await createUser({ ...payload, email: form.email });
    } else {
      await updateUser(editUser._id, payload);
    }
    setShowModal(false);
    loadData();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Team Members</h2>
          <p className="text-slate-500">Manage access levels and department assignments.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          Add New Member
        </button>
      </div>

      {/* --- FILTERS & SEARCH --- */}
      <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 flex items-center px-4 gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full py-2 bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- USER LIST / TABLE --- */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <div className="col-span-5">Member</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Department</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredUsers.length === 0 ? (
            <div className="py-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={28} />
              </div>
              <p className="text-slate-400 font-medium">No users found matching your search.</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <UserRow key={u._id} user={u} onEdit={() => openEdit(u)} />
            ))
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={editUser ? "Update Profile" : "Onboard Member"}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <FormInput 
              label="Full Name" 
              value={form.name} 
              onChange={(v) => setForm({ ...form, name: v })} 
              placeholder="John Doe" 
            />
            <FormInput 
              label="Email Address" 
              value={form.email} 
              disabled={!!editUser}
              onChange={(v) => setForm({ ...form, email: v })} 
              placeholder="john@company.com" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Role</label>
              <select
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Team</label>
              <select
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              >
                <option value="">Freelance / None</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={submit}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            {editUser ? "Update Member" : "Create Account"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function UserRow({ user, onEdit }) {
  const roleColors = {
    admin: "bg-red-50 text-red-600 ring-red-500/20",
    manager: "bg-blue-50 text-blue-600 ring-blue-500/20",
    employee: "bg-slate-50 text-slate-600 ring-slate-500/20",
  };

  return (
    <div className="group md:grid md:grid-cols-12 flex flex-col gap-4 px-6 py-5 md:px-8 md:items-center hover:bg-slate-50/80 transition-colors">
      
      {/* User Info */}
      <div className="col-span-5 flex items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate">{user.name}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Mail size={12} /> {user.email}
          </p>
        </div>
      </div>

      {/* Role - Mobile Friendly Layout */}
      <div className="col-span-3 flex md:block items-center justify-between">
        <span className="text-xs font-bold text-slate-400 md:hidden uppercase tracking-tighter">Role</span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg ring-1 ring-inset uppercase ${roleColors[user.role]}`}>
          <Shield size={12} />
          {user.role}
        </span>
      </div>

      {/* Team */}
      <div className="col-span-3 flex md:block items-center justify-between">
        <span className="text-xs font-bold text-slate-400 md:hidden uppercase tracking-tighter">Team</span>
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
 {user.teamId?.name ? (
  <div className="flex items-center gap-1.5">
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
    {user.teamId.name}
  </div>
) : (
  <span className="text-slate-300 italic text-xs font-normal">
    Unassigned
  </span>
)}

        </div>
      </div>

      {/* Actions */}
      <div className="col-span-1 text-right flex md:block justify-end pt-2 md:pt-0">
        <button
          onClick={onEdit}
          className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 ml-1">{label}</label>
      <input
        disabled={disabled}
        className={`w-full bg-slate-50 border-none ring-1 ring-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}