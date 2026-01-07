import { useEffect, useState } from "react";
import { fetchUsers, createUser, updateUser } from "../services/userService";
import Modal from "../components/Modal";


export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee"
  });

  useEffect(() => {
    loadUsers();
  }, []);

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
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ""
    });
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.name || !form.email) return;

    if (editUser) {
      await updateUser(editUser._id, {
        name: form.name,
        role: form.role
      });
    } else {
      await createUser(form);
    }

    setShowModal(false);
    loadUsers();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <button
          onClick={openAdd}
          className="bg-black text-white px-4 py-2 rounded-md text-sm"
        >
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Email</th>
              <th className="text-left py-2 px-3">Role</th>
              <th className="text-left py-2 px-3">Status</th>
              <th className="text-right py-2 px-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No users found
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => openEdit(u)}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? "Edit User" : "Add User"}
      >
        <div className="space-y-3">
          <input
            className="border p-2 w-full rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border p-2 w-full rounded"
            placeholder="Email"
            disabled={!!editUser}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {!editUser && (
            <input
              type="password"
              className="border p-2 w-full rounded"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}

          <select
            className="border p-2 w-full rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          <button
            onClick={submit}
            className="bg-black text-white w-full py-2 rounded"
          >
            {editUser ? "Update User" : "Create User"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
