import { useState } from "react";
import { forgotPassword } from "../services/authService";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await forgotPassword({ email });
      setSuccess("OTP sent to your email");
      navigate("/reset-password", { state: { email } });
    } catch {
      setError("Email not registered");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your registered email
          </p>

          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
