import { useEffect, useState } from "react";
import { getPaymentById, updatePayment } from "../services/paymentCollectionService";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiRefreshCw, FiDollarSign, FiUser, FiBriefcase, FiHash, FiFileText } from "react-icons/fi";

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    clientName: "",
    companyName: "",
    amount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: "",
  });

  // Fetch existing data on mount
  useEffect(() => {
    getPaymentById(id)
      .then((res) => {
        setForm(res.data);
        setFetching(false);
      })
      .catch((err) => {
        toast.error("Failed to load payment details");
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
      toast.success("Payment updated successfully!");
      navigate("/payments/my");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation Link */}
        <Link 
          to="/payments/my" 
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to My Payments
        </Link>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Edit Payment</h2>
            <p className="text-indigo-100 text-sm mt-1">Update the transaction details for this collection.</p>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiUser className="mr-2 text-gray-400" /> Client Name *
                </label>
                <input
                  name="clientName"
                  value={form.clientName}
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiBriefcase className="mr-2 text-gray-400" /> Company Name
                </label>
                <input
                  name="companyName"
                  value={form.companyName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiDollarSign className="mr-2 text-gray-400" /> Amount (₹) *
                </label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-emerald-600"
                  placeholder="0.00"
                />
              </div>

              {/* Payment Mode */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <FiHash className="mr-2 text-gray-400" /> Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Reference ID */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <FiHash className="mr-2 text-gray-400" /> Reference ID
              </label>
              <input
                name="referenceId"
                value={form.referenceId || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="TXN123456"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <FiFileText className="mr-2 text-gray-400" /> Notes
              </label>
              <textarea
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Details..."
              />
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className={`w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all active:scale-95 ${
                loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiRefreshCw className="mr-2" /> Update Payment
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}