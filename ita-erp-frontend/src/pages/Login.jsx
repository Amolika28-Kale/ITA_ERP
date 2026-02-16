import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  CheckCircle
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ================= EMAIL / PASSWORD LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await login({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
localStorage.setItem("loginTime", new Date().toISOString());
      if (res.data.user.role === "employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
const handleGoogleLogin = () => {
  window.location.href =
    "https://ita-erp.onrender.com/api/auth/google";
};


  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ===== LEFT INFO PANEL ===== */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-slate-900 to-indigo-900 text-white px-16">
        <div className="flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight">
            Manage Tasks.
            <span className="block text-indigo-300">Empower Teams.</span>
          </h1>

          <p className="mt-6 text-slate-300 text-lg">
            ITA-ERP helps your organization manage projects, assign tasks,
            track performance, and collaborate efficiently.
          </p>

          <ul className="mt-8 space-y-4">
            <Feature text="Role-based dashboards" />
            <Feature text="Real-time task tracking" />
            <Feature text="Secure & scalable platform" />
            <Feature text="Optimized for teams & enterprises" />
          </ul>
        </div>

        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
      </div>

      {/* ===== RIGHT LOGIN PANEL ===== */}
      <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4 overflow-hidden border border-slate-100">
  <img 
    src="/ITA-logo.png" 
    alt="ITA Logo" 
    className="w-full h-full object-contain p-0" 
  />
</div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              ITA-ERP
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white">

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ===== GOOGLE LOGIN ===== */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-300 bg-white font-semibold hover:bg-gray-100 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            {/* ===== EMAIL LOGIN FORM ===== */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <span
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition disabled:opacity-70"
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Signup */}
            <p className="mt-4 text-center text-sm text-gray-600">
              New here?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-gray-900 font-semibold cursor-pointer hover:underline"
              >
                Create account
              </span>
            </p>

            <p className="mt-8 text-center text-xs text-gray-500">
              © 2026 ITA-ERP Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== FEATURE ITEM ===== */
function Feature({ text }) {
  return (
    <li className="flex items-center gap-3 text-slate-200">
      <CheckCircle className="text-indigo-400" size={18} />
      <span>{text}</span>
    </li>
  );
}
