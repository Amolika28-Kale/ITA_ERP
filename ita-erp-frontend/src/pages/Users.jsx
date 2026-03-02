import { useEffect, useState } from "react";
import { fetchUsers, createUser, updateUser } from "../services/userService";
import { fetchTeams } from "../services/teamService";
import { getStaffById } from "../services/settingsService";
import Modal from "../components/Modal";
import { 
  UserPlus, Edit2, Shield, Mail, 
  Search, CheckCircle2, Filter,
  XCircle, User, MoreVertical, Eye,
  Phone, MapPin, Calendar, Briefcase, 
  Banknote, Heart, Star, FileText,
  X, Download, Menu, Grid, List
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' for mobile, 'table' for desktop
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // State for staff details modal
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    role: "employee",
    password: "" 
  });

  useEffect(() => { 
    loadData(); 
    // Check screen size for default view mode
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("grid");
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Staff details fetch function
  const viewStaffDetails = async (userId) => {
    setLoadingStaff(true);
    try {
      const res = await getStaffById(userId);
      setSelectedStaff(res.data);
      setShowStaffModal(true);
    } catch (err) {
      toast.error("Failed to load staff details");
    } finally {
      setLoadingStaff(false);
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
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setShowMobileFilters(false);
  };

  const roleColors = {
    admin: "bg-red-50 text-red-700 ring-red-500/20",
    manager: "bg-blue-50 text-blue-700 ring-blue-500/20",
    employee: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-sm font-medium text-slate-500 text-center">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Team <span className="text-indigo-600">Members</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 flex items-center justify-center sm:justify-start gap-2">
            <User size={14} />
            {users.length} Total Users
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm"
          >
            <Filter size={16} />
            Filters
            {(searchQuery || roleFilter !== "all") && (
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            )}
          </button>

          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="sm:inline">Add Member</span>
          </button>
        </div>
      </div>

      {/* Search & Filters - Desktop */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filters - Expandable */}
      {showMobileFilters && (
        <div className="sm:hidden bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={clearFilters}
              className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
            >
              Clear
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Results Count - Mobile Optimized */}
      <div className="flex items-center justify-between px-1 sm:px-2">
        <p className="text-xs sm:text-sm text-slate-600">
          Showing <span className="font-bold text-indigo-600">{filteredUsers.length}</span> of {users.length}
        </p>
        {filteredUsers.length > 0 && (
          <p className="text-[10px] sm:text-xs text-slate-400">
            {roleFilter !== "all" ? roleFilter : "All"} members
          </p>
        )}
      </div>

      {/* Mobile View - Grid Cards */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user._id} 
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <button
                      onClick={() => viewStaffDetails(user._id)}
                      className="font-bold text-slate-800 hover:text-indigo-600 text-left"
                    >
                      {user.name}
                    </button>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> 
                      <span className="truncate max-w-[150px]">{user.email}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => viewStaffDetails(user._id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Role</p>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 mt-1 text-[10px] font-bold rounded-full ${roleColors[user.role]}`}>
                    <Shield size={10} />
                    {user.role}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Status</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Active</span>
                  </div>
                </div>
                {user.department && (
                  <div className="col-span-2 mt-1">
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Department</p>
                    <p className="text-xs text-slate-700 mt-1">{user.department}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-4">Member</div>
          <div className="col-span-2">Role</div>
          {/* <div className="col-span-2">Department</div> */}
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
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
                {/* User Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0">
                    <button
                      onClick={() => viewStaffDetails(user._id)}
                      className="font-bold text-slate-800 truncate hover:text-indigo-600 hover:underline text-left"
                    >
                      {user.name}
                    </button>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail size={11} /> 
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${roleColors[user.role]}`}>
                    <Shield size={11} />
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                </div>

                {/* Department */}
                {/* <div className="col-span-2">
                  <span className="text-sm text-slate-600">
                    {user.department || "—"}
                  </span>
                </div> */}

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Active</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2 text-right flex items-center justify-end gap-2">
                  <button
                    onClick={() => viewStaffDetails(user._id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit User"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Staff Details Modal - Mobile Optimized */}
      <Modal
        open={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        title="Staff Details"
        maxWidth="max-w-4xl"
        showFooter={false}
      >
        {loadingStaff ? (
          <div className="flex justify-center py-8 sm:py-12">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : selectedStaff ? (
          <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 border-b">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg mx-auto sm:mx-0">
                {selectedStaff.name?.charAt(0)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedStaff.name}</h2>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 justify-center sm:justify-start mt-1">
                  <Mail size={14} /> {selectedStaff.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                  <span className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-full ${roleColors[selectedStaff.role]}`}>
                    {selectedStaff.role}
                  </span>
                  {selectedStaff.department && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] sm:text-xs font-bold">
                      {selectedStaff.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Phone size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                  Contact Details
                </h3>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl space-y-2 text-xs sm:text-sm">
                  {selectedStaff.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                      <span className="break-all">{selectedStaff.phone}</span>
                    </p>
                  )}
                  {selectedStaff.whatsappNumber && (
                    <p className="flex items-center gap-2">
                      <Phone size={12} className="sm:w-3.5 sm:h-3.5 text-green-600 shrink-0" />
                      <span className="break-all">{selectedStaff.whatsappNumber} (WhatsApp)</span>
                    </p>
                  )}
                  {selectedStaff.address && (
                    <p className="flex items-start gap-2">
                      <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="break-words">{selectedStaff.address}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={14} className="sm:w-4 sm:h-4 text-purple-600" />
                  Important Dates
                </h3>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl space-y-2 text-xs sm:text-sm">
                  {selectedStaff.dateOfBirth && (
                    <p className="flex items-center gap-2">
                      <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                      <span>DOB: {format(new Date(selectedStaff.dateOfBirth), "dd MMM yyyy")}</span>
                    </p>
                  )}
                  {selectedStaff.joiningDate && (
                    <p className="flex items-center gap-2">
                      <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                      <span>Joined: {format(new Date(selectedStaff.joiningDate), "dd MMM yyyy")}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedStaff.bio && (
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                  <FileText size={14} className="sm:w-4 sm:h-4 text-amber-600" />
                  Bio
                </h3>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{selectedStaff.bio}</p>
                </div>
              </div>
            )}

            {/* Bank Details */}
            {selectedStaff.bankDetails && Object.values(selectedStaff.bankDetails).some(Boolean) && (
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Banknote size={14} className="sm:w-4 sm:h-4 text-emerald-600" />
                  Bank Details
                </h3>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {selectedStaff.bankDetails.accountHolderName && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400">Account Holder</p>
                      <p className="text-xs sm:text-sm font-medium break-words">{selectedStaff.bankDetails.accountHolderName}</p>
                    </div>
                  )}
                  {selectedStaff.bankDetails.bankName && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400">Bank Name</p>
                      <p className="text-xs sm:text-sm break-words">{selectedStaff.bankDetails.bankName}</p>
                    </div>
                  )}
                  {selectedStaff.bankDetails.accountNumber && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400">Account Number</p>
                      <p className="text-xs sm:text-sm font-mono break-all">{selectedStaff.bankDetails.accountNumber}</p>
                    </div>
                  )}
                  {selectedStaff.bankDetails.ifscCode && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400">IFSC Code</p>
                      <p className="text-xs sm:text-sm font-mono break-all">{selectedStaff.bankDetails.ifscCode}</p>
                    </div>
                  )}
                  {selectedStaff.bankDetails.upiId && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] sm:text-xs text-slate-400">UPI ID</p>
                      <p className="text-xs sm:text-sm break-all">{selectedStaff.bankDetails.upiId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal Wishlist & Expectations */}
            {(selectedStaff.personalWishlist || selectedStaff.expectationsFromITA) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedStaff.personalWishlist && (
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Heart size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      Wishlist
                    </h3>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{selectedStaff.personalWishlist}</p>
                    </div>
                  </div>
                )}
                {selectedStaff.expectationsFromITA && (
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Star size={14} className="sm:w-4 sm:h-4 text-yellow-600" />
                      Expectations
                    </h3>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{selectedStaff.expectationsFromITA}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">No details available</div>
        )}
      </Modal>

      {/* Add/Edit User Modal */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={editUser ? "Edit Member" : "Add New Member"}
        showFooter={false}
      >
        <div className="space-y-4 sm:space-y-5">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
              <User size={12} /> Full Name
            </label>
            <input
              className="w-full bg-slate-50 border border-slate-200 p-2.5 sm:p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g., John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-200 p-2.5 sm:p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="john@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!editUser}
            />
            {editUser && (
              <p className="text-[10px] text-amber-500 mt-1">Email cannot be changed</p>
            )}
          </div>

          {/* Password Input */}
          {!editUser && (
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                <Shield size={12} /> Password
              </label>
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 sm:p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
              <Shield size={12} /> Role
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 p-2.5 sm:p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="w-full sm:flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="w-full sm:flex-1 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-2"
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