import { useState } from "react";
import { createPayment } from "../services/paymentCollectionService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft, FiSave, FiUser, FiBriefcase,
  FiHash, FiFileText, FiPhone, FiDollarSign
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AddPayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "", // Added for WhatsApp integration
    companyName: "",
    totalAmount: "",
    paidAmount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Function to Generate PDF & Redirect to WhatsApp
  const handleReceiptAndWhatsApp = (paymentData) => {
    const remaining = Number(paymentData.totalAmount) - Number(paymentData.paidAmount);

    // 1. Generate PDF Receipt
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Receipt ID: ${paymentData._id?.slice(-6).toUpperCase() || 'TEMP'}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [["Description", "Details"]],
      body: [
        ["Client Name", paymentData.clientName],
        ["Workshop Name", paymentData.companyName || "N/A"],
        ["Total Amount", `INR ${paymentData.totalAmount}`],
        ["Amount Paid", `INR ${paymentData.paidAmount}`],
        ["Remaining Balance", `INR ${remaining}`],
        ["Payment Mode", paymentData.paymentMode.toUpperCase()],
      ],
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Receipt_${paymentData.clientName}.pdf`);

    // 2. WhatsApp Message Link
    const message = `*PAYMENT RECEIVED* ✅%0A--------------------------%0AHello *${paymentData.clientName}*,%0AWe have received your payment of *₹${paymentData.paidAmount}*.%0A%0A💰 *Total Deal:* ₹${paymentData.totalAmount}%0A💵 *Currently Paid:* ₹${paymentData.paidAmount}%0A⏳ *Remaining Balance:* ₹${remaining}%0A%0A_Thank you for choosing us!_`;
    
    window.open(`https://wa.me/${paymentData.clientPhone}?text=${message}`, "_blank");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.clientPhone.length < 10) return toast.error("Enter valid WhatsApp number");
    
    setLoading(true);
    try {
      const res = await createPayment(form);
      toast.success("Payment recorded successfully!");
      
      // Trigger Receipt and WhatsApp
      handleReceiptAndWhatsApp(res.data);
      
      navigate("/payments/my");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const pending = Number(form.totalAmount) - Number(form.paidAmount);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/payments/my" className="inline-flex items-center text-indigo-600 font-bold mb-6 hover:translate-x-[-4px] transition-transform">
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 px-8 py-8 text-white">
            <h2 className="text-3xl font-black italic uppercase tracking-widest">
              Add Collection
            </h2>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            {/* Client Info Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                  <FiUser /> Client Name *
                </label>
                <input
                  name="clientName"
                  required
                  placeholder="John Doe"
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
                  required
                  placeholder="919876543210"
                  value={form.clientPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                <FiBriefcase /> Workshop Name
              </label>
              <input
                name="companyName"
                placeholder="Workshop XYZ"
                value={form.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Financials Section */}
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase ml-2">Total Amount</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={form.totalAmount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-none rounded-xl font-black text-lg text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">Currently Paid</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-none rounded-xl font-black text-lg text-emerald-600"
                />
              </div>
            </div>

            {/* Remaining Calculation Display */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 rounded-2xl text-white">
               <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Remaining Balance</p>
                  <p className={`text-2xl font-black ${pending > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                    ₹{pending || 0}
                  </p>
               </div>
               {pending > 0 && (
                 <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30 uppercase">
                    Part Payment
                 </span>
               )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Online</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                  <FiHash /> Reference ID
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
                placeholder="Any special remarks..."
                onChange={handleChange}
                value={form.notes}
                rows="3"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-5 rounded-[1.5rem] bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Recording..." : <><FiSave size={18} /> Confirm & Send Receipt</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}