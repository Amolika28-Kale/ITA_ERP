import { useState } from "react";
import { createPayment } from "../services/paymentCollectionService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft, FiSave, FiUser, FiBriefcase,
  FiHash, FiFileText, FiPhone, FiHome
} from "react-icons/fi";
import { generateInvoice, sendWhatsAppWithInvoice } from "../utils/invoiceGenerator";

export default function AddPayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    address: "",
    companyName: "",
    totalAmount: "",
    paidAmount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.clientPhone.length < 10) return toast.error("Enter valid WhatsApp number");
    
    setLoading(true);
    try {
      const res = await createPayment(form);
      toast.success("Payment recorded successfully!");
      
      // Generate and send invoice
      const doc = generateInvoice(res.data);
      sendWhatsAppWithInvoice(res.data, doc);
      
      navigate("/payments/my");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const pending = Number(form.totalAmount) - Number(form.paidAmount);

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/payments/my" className="inline-flex items-center text-indigo-600 font-bold mb-4 sm:mb-6 hover:translate-x-[-4px] transition-transform p-2">
          <FiArrowLeft className="mr-2" /> <span className="text-sm sm:text-base">Back to Dashboard</span>
        </Link>

        <div className="bg-white shadow-xl sm:shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 sm:px-8 sm:py-8 text-white">
            <h2 className="text-xl sm:text-3xl font-black italic uppercase tracking-widest">
              Indian Traders Academy
            </h2>
            <p className="text-indigo-100 text-xs mt-2">www.indiantradersacademy.com • 9595064141</p>
          </div>

          <form onSubmit={submit} className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                  <FiUser /> Client Name *
                </label>
                <input
                  name="clientName"
                  required
                  placeholder="Kartik Jadhav"
                  value={form.clientName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                  <FiPhone /> WhatsApp Number *
                </label>
                <input
                  name="clientPhone"
                  type="tel"
                  required
                  placeholder="9552355781"
                  value={form.clientPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                <FiHome /> Address
              </label>
              <input
                name="address"
                placeholder="Customer address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                <FiBriefcase /> Workshop/Course Name
              </label>
              <input
                name="companyName"
                placeholder="Basic Trading Course"
                value={form.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 bg-indigo-50/50 rounded-[1.2rem] sm:rounded-[1.5rem] border border-indigo-100">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase ml-2">Total Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="totalAmount"
                  value={form.totalAmount}
                  onChange={handleChange}
                  required
                  placeholder="30000.00"
                  className="w-full px-4 py-3 bg-white border-none rounded-xl font-black text-base sm:text-lg text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">Paid Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleChange}
                  required
                  placeholder="30000.00"
                  className="w-full px-4 py-3 bg-white border-none rounded-xl font-black text-base sm:text-lg text-emerald-600"
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between px-5 py-4 bg-slate-900 rounded-2xl text-white">
                <div>
                   <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest">Remaining Balance</p>
                   <p className={`text-xl sm:text-2xl font-black ${pending > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                     ₹{pending > 0 ? pending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                   </p>
                </div>
                {pending > 0 ? (
                  <span className="text-[8px] sm:text-[10px] font-black bg-orange-500/20 text-orange-400 px-2 sm:px-3 py-1 rounded-full border border-orange-500/30 uppercase">
                    Part Payment
                  </span>
                ) : (
                  <span className="text-[8px] sm:text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 sm:px-3 py-1 rounded-full border border-emerald-500/30 uppercase">
                    Paid in Full
                  </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Digital Wallet</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="card">Card Payment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                  <FiHash /> Transaction ID
                </label>
                <input
                  name="referenceId"
                  placeholder="TXN123456"
                  value={form.referenceId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                <FiFileText /> Notes
              </label>
              <textarea
                name="notes"
                placeholder="Basic plus advance offline"
                onChange={handleChange}
                value={form.notes}
                rows="2"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-slate-900 hover:to-slate-900 text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Generating Invoice..." : <><FiSave size={18} /> Generate Invoice & Send</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}