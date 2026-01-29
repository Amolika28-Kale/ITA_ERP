import { useState } from "react";
import { createPayment } from "../services/paymentCollectionService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiDollarSign, FiUser, FiBriefcase, FiHash, FiFileText } from "react-icons/fi";

export default function AddPayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    companyName: "",
    amount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPayment(form);
      toast.success("Payment recorded successfully!");
      navigate("/payments/my");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/payments/my" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6 transition-colors">
          <FiArrowLeft className="mr-2" /> Back to My Payments
        </Link>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Add New Payment</h2>
            <p className="text-indigo-100 text-sm mt-1">Record a new collection.</p>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiUser className="mr-2 text-gray-400" /> Client Name *
                </label>
                <input name="clientName" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiBriefcase className="mr-2 text-gray-400" /> Company Name
                </label>
                <input name="companyName" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Acme Corp" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiDollarSign className="mr-2 text-gray-400" /> Amount (₹) *
                </label>
                <input name="amount" type="number" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-600 outline-none" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiHash className="mr-2 text-gray-400" /> Payment Mode
                </label>
                <select name="paymentMode" onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <FiHash className="mr-2 text-gray-400" /> Reference ID
              </label>
              <input name="referenceId" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="TXN123456" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <FiFileText className="mr-2 text-gray-400" /> Notes
              </label>
              <textarea name="notes" onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Details..." />
            </div>

            <button disabled={loading} className={`w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all active:scale-95 ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
              {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><FiSave className="mr-2" /> Save Payment</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}