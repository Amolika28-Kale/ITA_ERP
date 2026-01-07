import { useEffect, useState } from "react";
import { fetchUsers, createUser, updateUser, toggleUserStatus } from "../services/userService";
import Modal from "../components/Modal";
// Optional: npm install lucide-react
import { UserPlus, Edit2, Shield, Mail, MoreVertical } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const res = await fetchUsers();
    setUsers(res.data);
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", password: "", role: "employee" });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: "" });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.name || !form.email) return;
    editUser ? await updateUser(editUser._id, { name: form.name, role: form.role }) : await createUser(form);
    setShowModal(false);
    loadUsers();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">Manage your team members and their account permissions.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400 italic">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={12} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        <Shield size={12} className="text-gray-500" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {u.isActive ? "Active" : "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-indigo-600 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editUser ? "Update Profile" : "Create New Account"}>
        <div className="space-y-4 p-1">
          <div className="grid gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">Full Name</label>
              <input
                className="w-full border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 bg-gray-50 rounded-xl transition-all outline-none border"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">Email Address</label>
              <input
                className="w-full border-gray-200 disabled:opacity-50 p-2.5 bg-gray-50 rounded-xl outline-none border"
                placeholder="name@company.com"
                disabled={!!editUser}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {!editUser && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Password</label>
                <input
                  type="password"
                  className="w-full border-gray-200 p-2.5 bg-gray-50 rounded-xl outline-none border"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">Access Level</label>
              <select
                className="w-full border-gray-200 p-2.5 bg-gray-50 rounded-xl outline-none border appearance-none"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="manager">Manager (Limited)</option>
                <option value="employee">Employee (Read-only)</option>
              </select>
            </div>
          </div>

          <button
            onClick={submit}
            className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-gray-200 mt-2"
          >
            {editUser ? "Save Changes" : "Create User"}
          </button>
        </div>
      </Modal>
    </div>
  );
}