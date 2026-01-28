import { useState } from "react";
import { createRequirement } from "../services/requirementService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CreateRequirement({
  form: externalForm,
  setForm: externalSetForm,
  onSubmit,
  isEdit = false,
}) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false); // ✅ Track loading state

  const [localForm, setLocalForm] = useState({
    title: "",
    description: "",
    category: "Other",
    priority: "Medium",
  });

  const form = externalForm ?? localForm;
  const setForm = externalSetForm ?? setLocalForm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double clicks

    setSubmitting(true); // ✅ Start loading

    try {
      if (isEdit) {
        await onSubmit();
        toast.success("Requirement updated ✏️");
      } else {
        await createRequirement(form);
        toast.success("Requirement submitted successfully ✅");
      }
      
      // ✅ Navigate ONLY after success
      navigate("/my-requests"); 
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Operation failed ❌");
    } finally {
      setSubmitting(false); // ✅ Stop loading regardless of success/fail
    }
  };

  const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none transition-all";
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="flex justify-center bg-gray-50 p-6 min-h-screen">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl self-start">
        <div className="bg-blue-600 h-2 rounded-t-2xl" />

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Edit Requirement" : "New Requirement"}
          </h2>

          <div>
            <label className={labelStyle}>Title</label>
            <input
              className={inputStyle}
              placeholder="Enter title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelStyle}>Description</label>
            <textarea
              className={`${inputStyle} min-h-[120px]`}
              placeholder="Describe your requirement..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Category</label>
              <select
                className={inputStyle}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                disabled={submitting}
              >
                <option>Leave</option>
                <option>Asset</option>
                <option>Support</option>
                <option>Approval</option>
                <option>Complaint</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>Priority</label>
              <select
                className={inputStyle}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                disabled={submitting}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting} // ✅ Disable button while loading
            className={`w-full text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
              ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"}
            `}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              isEdit ? "Update Requirement" : "Submit Requirement"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}