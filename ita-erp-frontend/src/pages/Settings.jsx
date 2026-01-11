import { useEffect, useState } from "react";
import { User, Lock, Mail, ShieldCheck, Save, Loader2 } from "lucide-react"; // Icons for better UI
import { fetchMyProfile, updateProfile, changePassword } from "../services/settingsService";

export default function Settings() {
  const [profile, setProfile] = useState({});
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyProfile().then((res) => setProfile(res.data));
  }, []);

  const showFeedback = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({ name: profile.name });
      showFeedback("Profile updated successfully");
    } catch (err) {
      showFeedback("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const updatePass = async () => {
    setLoading(true);
    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      showFeedback("Password changed successfully");
    } catch (err) {
      showFeedback("Check your current password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile information and security preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INFO */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User size={20} className="text-blue-600" /> Personal Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">Update your display name and view account-linked details.</p>
        </div>

        {/* RIGHT COLUMN: PROFILE FORM */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 opacity-75">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Mail size={14} /> Email Address
              </label>
              <input className="w-full p-2.5 bg-gray-50 border rounded-lg cursor-not-allowed" value={profile.email || ""} disabled />
            </div>
          </div>

          <div className="space-y-2 opacity-75">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <ShieldCheck size={14} /> Account Role
            </label>
            <input className="w-full p-2.5 bg-gray-50 border rounded-lg cursor-not-allowed capitalize" value={profile.role || ""} disabled />
          </div>

          <button 
            onClick={saveProfile} 
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

        <hr className="lg:hidden" />

        {/* LEFT COLUMN: SECURITY INFO */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock size={20} className="text-red-600" /> Security
          </h2>
          <p className="text-sm text-gray-500 mt-1">Keep your account secure with a strong password.</p>
        </div>

        {/* RIGHT COLUMN: PASSWORD FORM */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-5">
          <div className="space-y-4">
            <input
              type="password"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />
            <input
              type="password"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
          </div>

          <button 
            onClick={updatePass}
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition active:scale-95 disabled:opacity-50"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* FLOATING NOTIFICATION */}
      {msg.text && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white transition-all animate-bounce ${
          msg.type === "error" ? "bg-red-600" : "bg-green-600"
        }`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}