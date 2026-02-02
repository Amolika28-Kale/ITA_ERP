import { useEffect, useState } from "react";
import {
  getPaymentById,
  updatePayment
} from "../services/paymentCollectionService";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiUser,
  FiBriefcase,
  FiHash,
  FiFileText
} from "react-icons/fi";

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    clientName: "",
    companyName: "",
    totalAmount: "",
    paidAmount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: ""
  });

  // Fetch payment
  useEffect(() => {
    getPaymentById(id)
      .then((res) => {
        setForm({
          clientName: res.data.clientName,
          companyName: res.data.companyName || "",
          totalAmount: res.data.totalAmount,
          paidAmount: res.data.paidAmount,
          paymentMode: res.data.paymentMode,
          referenceId: res.data.referenceId || "",
          notes: res.data.notes || ""
        });
        setFetching(false);
      })
      .catch(() => {
        toast.error("Failed to load payment");
        setFetching(false);
      });
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePayment(id, form);
      toast.success("Payment updated successfully");
      navigate("/payments/my");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  const pending =
    Number(form.totalAmount) - Number(form.paidAmount);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <Link to="/payments/my" className="inline-flex items-center text-indigo-600 mb-6">
          <FiArrowLeft className="mr-2" /> Back
        </Link>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Edit Payment
            </h2>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">

            {/* Client + Company */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-sm flex items-center">
                  <FiUser className="mr-2" /> Client Name *
                </label>
                <input
                  name="clientName"
                  value={form.clientName}
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-sm flex items-center">
                  <FiBriefcase className="mr-2" /> Company Name
                </label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>
            </div>

            {/* Amounts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Total Amount"
                name="totalAmount"
                value={form.totalAmount}
                onChange={handleChange}
              />
              <Input
                label="Paid Amount"
                name="paidAmount"
                value={form.paidAmount}
                onChange={handleChange}
              />
            </div>

            {/* Part Payment */}
            {pending > 0 && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-orange-700 font-bold text-sm">
                PART PAYMENT • Pending ₹{pending}
              </div>
            )}

            {/* Mode */}
            <div>
              <label className="font-semibold text-sm flex items-center">
                <FiHash className="mr-2" /> Payment Mode
              </label>
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="font-semibold text-sm flex items-center">
                <FiHash className="mr-2" /> Reference ID
              </label>
              <input
                name="referenceId"
                value={form.referenceId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="font-semibold text-sm flex items-center">
                <FiFileText className="mr-2" /> Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2.5 border rounded-lg"
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold flex justify-center items-center"
            >
              {loading ? "Updating..." : <><FiRefreshCw className="mr-2" /> Update Payment</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable Input */
function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="font-semibold text-sm">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>
  );
}
