import { useState } from "react";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { submitAchievement } from "../services/attendanceService";

export default function AchievementModal({ onSuccess }) {
  const [achievement, setAchievement] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (achievement.trim().length < 5) {
      return toast.error("Please write a valid achievement");
    }

    try {
      setLoading(true);
      await submitAchievement(achievement);
      toast.success("Achievement submitted ✅");
      onSuccess(); // 🔥 just close modal
    } catch {
      toast.error("Failed to submit achievement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6">
        <h2 className="font-black mb-3">Today's Achievement</h2>

        <textarea
          value={achievement}
          onChange={(e) => setAchievement(e.target.value)}
          className="w-full h-28 border rounded-xl p-3"
          placeholder="What did you achieve today?"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex justify-center gap-2"
        >
          <CheckCircle size={18} />
          Submit & Logout
        </button>
      </div>
    </div>
  );
}
