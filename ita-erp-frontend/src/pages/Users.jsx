import { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUser
} from "../services/userService";
import { fetchTeams } from "../services/teamService";
import Modal from "../components/Modal";
import {
  UserPlus,
  Edit2,
  Shield,
  Mail,
  Users as TeamIcon
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "employee",
    teamId: ""
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [uRes, tRes] = await Promise.all([
      fetchUsers(),
      fetchTeams()
    ]);
    setUsers(uRes.data);
    setTeams(tRes.data);
  };

  /* ================= MODAL ================= */
  const openAdd = () => {
    setEditUser(null);
    setForm({
      name: "",
      email: "",
      role: "employee",
      teamId: ""
    });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId?._id || ""
    });
    setShowModal(true);
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!form.name || !form.email) return;

    const payload = {
      name: form.name,
      role: form.role,
      teamId: form.teamId || null
    };

    if (!editUser) {
      await createUser({
        ...payload,
        email: form.email
      });
    } else {
      await updateUser(editUser._id, payload);
    }

    setShowModal(false);
    loadData();
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow border">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-sm text-gray-500">
            Manage users, roles & team assignments
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold">USER</th>
              <th className="px-6 py-4 text-xs font-bold">ROLE</th>
              <th className="px-6 py-4 text-xs font-bold">TEAM</th>
              <th className="px-6 py-4 text-right text-xs font-bold">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {u.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-gray-100 capitalize">
                    <Shield size={12} />
                    {u.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {u.teamId ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                      <TeamIcon size={12} />
                      {u.teamId.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      No Team
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? "Edit User" : "Create User"}
      >
        <div className="space-y-4">

          <input
            placeholder="Full Name"
            className="w-full border p-3 rounded-xl bg-gray-50"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            disabled={!!editUser}
            className="w-full border p-3 rounded-xl bg-gray-50"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <select
            className="w-full border p-3 rounded-xl bg-gray-50"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          {/* TEAM ASSIGN */}
          <select
            className="w-full border p-3 rounded-xl bg-gray-50"
            value={form.teamId}
            onChange={(e) =>
              setForm({ ...form, teamId: e.target.value })
            }
          >
            <option value="">No Team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={submit}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700"
          >
            {editUser ? "Save Changes" : "Create User"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
