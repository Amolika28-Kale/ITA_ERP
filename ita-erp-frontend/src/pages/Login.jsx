import { useState } from "react";
import { login } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 md:p-8">
        
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Task ERP
          </h1>
          <p className="text-sm text-gray-500">
            Admin Panel Login
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="admin@erp.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Task ERP
        </p>
      </div>
    </div>
  );
}
