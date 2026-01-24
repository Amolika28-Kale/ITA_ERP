import { useState } from "react";
import { resendOtp, verifyOtp } from "../services/authService";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await verifyOtp({ email: state?.email, otp });
      navigate("/login");
    } catch (err) {
      setError("Invalid OTP. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate("/signup")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft size={16} /> Back to Signup
        </button>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-white">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a code to <span className="font-semibold text-gray-900">{state?.email || "your email"}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full text-center text-2xl tracking-[0.5em] font-bold py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify Account"}
            </button>
          </form>

       <button
  onClick={() => resendOtp({ email: state.email })}
  className="text-indigo-600 font-semibold hover:underline"
>
  Resend OTP
</button>
        </div>
      </div>
    </div>
  );
}