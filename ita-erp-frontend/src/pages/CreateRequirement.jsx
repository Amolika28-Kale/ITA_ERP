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

  // ✅ fallback local state (for create mode)
  const [localForm, setLocalForm] = useState({
    title: "",
    description: "",
    category: "Other",
    priority: "Medium",
  });

  // 👉 decide which form to use
  const form = externalForm ?? localForm;
  const setForm = externalSetForm ?? setLocalForm;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await onSubmit();
        toast.success("Requirement updated ✏️");
      } else {
        await createRequirement(form);
        toast.success("Requirement submitted successfully ✅");
      }
      navigate("/my-requests");
    } catch {
      toast.error("Operation failed ❌");
    }
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50";
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="flex justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <div className="bg-blue-600 h-2" />

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <h2 className="text-2xl font-bold">
            {isEdit ? "Edit Requirement" : "New Requirement"}
          </h2>

          <div>
            <label className={labelStyle}>Title</label>
            <input
              className={inputStyle}
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className={labelStyle}>Description</label>
            <textarea
              className={`${inputStyle} min-h-[120px]`}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Category</label>
              <select
                className={inputStyle}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
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
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
            {isEdit ? "Update Requirement" : "Submit Requirement"}
          </button>
        </form>
      </div>
    </div>
  );
}
