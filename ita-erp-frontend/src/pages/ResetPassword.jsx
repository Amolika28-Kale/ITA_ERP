import { useState } from "react";
import { resetPassword } from "../services/authService";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword({
        email: state?.email,
        otp,
        newPassword: password
      });
      navigate("/login");
    } catch {
      setError("Invalid OTP or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter OTP & new password
        </p>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full text-center tracking-[0.4em] py-3 border rounded-lg"
            required
          />

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 py-2.5 border rounded-lg"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
