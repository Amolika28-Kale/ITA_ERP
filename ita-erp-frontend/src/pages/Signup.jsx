import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, CheckCircle } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await signup(form);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError("Failed to create account. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT PANEL */}

      {/* ===== LEFT INFO PANEL (DESKTOP ONLY) ===== */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-slate-900 to-indigo-900 text-white px-16">
        <div className="flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight">
            Manage Tasks.  
            <span className="block text-indigo-300">Empower Teams.</span>
          </h1>

          <p className="mt-6 text-slate-300 text-lg">
            Task ERP helps your organization manage projects, assign tasks,
            track performance, and collaborate efficiently.
          </p>

          <ul className="mt-8 space-y-4">
            <Feature text="Role-based dashboards" />
            <Feature text="Real-time task tracking" />
            <Feature text="Secure & scalable platform" />
            <Feature text="Optimized for teams & enterprises" />
          </ul>
        </div>

        {/* Decorative gradient circle */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4 py-12 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 text-white shadow-lg mb-4">
              <span className="text-2xl font-bold italic">T</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
            <p className="mt-2 text-sm text-gray-600">Enter your details to get started</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="John Doe"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="name@company.com"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="••••••••"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-gray-900 font-semibold cursor-pointer hover:underline">
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <li className="flex items-center gap-3 text-slate-200">
      <CheckCircle className="text-indigo-400" size={18} />
      <span>{text}</span>
    </li>
  );
}