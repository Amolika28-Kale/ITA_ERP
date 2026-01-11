import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
// Optional: npm install lucide-react for better icons
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents page refresh
    try {
      setLoading(true);
      setError("");

      const res = await login({ email, password });
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 text-white shadow-lg mb-4">
            <span className="text-2xl font-bold italic">T</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Task ERP</h1>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials to access your account</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all sm:text-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              ) : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer Note */}
          <p className="mt-8 text-center text-xs text-gray-500">
            &copy; 2026 Task ERP Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}