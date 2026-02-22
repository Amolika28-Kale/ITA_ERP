import { useEffect, useState } from "react";
import { fetchUsers, createUser, updateUser } from "../services/userService";
import { fetchTeams } from "../services/teamService";
import Modal from "../components/Modal";
import { 
  UserPlus, Edit2, Shield, Mail, 
  Search, CheckCircle2, Filter,
  XCircle, User, MoreVertical
} from "lucide-react";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    role: "employee",
    password: "" 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, tRes] = await Promise.all([fetchUsers(), fetchTeams()]);
      setUsers(uRes.data);
      setTeams(tRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", role: "employee", password: "" });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ 
      name: user.name, 
      email: user.email, 
      role: user.role,
      password: ""
    });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }

    const payload = { 
      name: form.name, 
      role: form.role
    };
    
    if (!editUser) {
      await createUser({ ...payload, email: form.email, password: form.password });
    } else {
      await updateUser(editUser._id, payload);
    }
    
    toast.success(editUser ? "User updated successfully" : "User created successfully");
    setShowModal(false);
    loadData();
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
  };

  const roleColors = {
    admin: "bg-red-50 text-red-700 ring-red-500/20",
    manager: "bg-blue-50 text-blue-700 ring-blue-500/20",
    employee: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-sm font-medium text-slate-500">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Team <span className="text-indigo-600">Members</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <User size={14} />
            Manage user access and permissions • {users.length} Total Users
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          Add New Member
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || roleFilter !== "all") && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-400">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                Search: "{searchQuery}"
              </span>
            )}
            {roleFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                Role: {roleFilter}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-auto"
            >
              <XCircle size={14} />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-600">
          Showing <span className="font-bold text-indigo-600">{filteredUsers.length}</span> of {users.length} members
        </p>
      </div>

      {/* User List - Table Format */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-5">Member</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-50">
          {filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No users found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors group"
              >
                {/* User Info - Column 1 */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail size={11} /> 
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>

                {/* Role - Column 2 */}
                <div className="col-span-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${roleColors[user.role]}`}>
                    <Shield size={11} />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>

                {/* Status - Column 3 (Department field replaced with Status) */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Active</span>
                  </div>
                </div>

                {/* Actions - Column 4 */}
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 text-slate-400 "
                    title="Edit user"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={editUser ? "Edit Member" : "Add New Member"}
        showFooter={false}
      >
        <div className="space-y-5">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
              <User size={12} /> Full Name
            </label>
            <input
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g., John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="john@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!editUser}
            />
            {editUser && (
              <p className="text-xs text-amber-500 mt-1">Email cannot be changed</p>
            )}
          </div>

          {/* Password Input - Only for new users */}
          {!editUser && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                <Shield size={12} /> Password
              </label>
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
              <Shield size={12} /> Role
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              {editUser ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}