import { useState } from "react";
import { createPayment } from "../services/paymentCollectionService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft, FiSave, FiUser, FiBriefcase,
  FiHash, FiFileText, FiPhone
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AddPayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    companyName: "",
    totalAmount: "",
    paidAmount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleReceiptAndWhatsApp = (paymentData) => {
    const remaining = Number(paymentData.totalAmount) - Number(paymentData.paidAmount);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 20, { align: "center" });

    // Payment Details Table
    autoTable(doc, {
      startY: 35,
      head: [["Description", "Details"]],
      body: [
        ["Client Name", paymentData.clientName],
        ["Workshop", paymentData.companyName || "N/A"],
        ["Total Deal Amount", `INR ${paymentData.totalAmount}`],
        ["Amount Paid Today", `INR ${paymentData.paidAmount}`],
        ["Remaining Balance", `INR ${remaining}`],
        ["Payment Mode", paymentData.paymentMode.toUpperCase()],
        ["Reference ID", paymentData.referenceId || "N/A"],
      ],
      headStyles: { fillColor: [79, 70, 229] },
      styles: { cellPadding: 5, fontSize: 10 },
    });

    // Final Position after table
    let finalY = doc.lastAutoTable.finalY + 15;

    // ✅ ३. Thank You Message
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // Dark Slate color
    doc.text("Thank you for choosing Indian Traders Academy.", 105, finalY, { align: "center" });

    // ✅ २. Terms & Conditions Section
    finalY += 15; // Space after thank you
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", 14, finalY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const terms = [
      "1. All payments made to Indian Traders Academy are non-refundable.",
      "2. This receipt is valid only for the specific workshop/course mentioned above.",
      "3. Access to course materials is subject to completion of total payment.",
      "4. This is a computer-generated receipt and does not require a physical signature."
    ];

    terms.forEach((line, index) => {
      doc.text(line, 14, finalY + 6 + (index * 5));
    });

    // Save PDF
    doc.save(`Receipt_${paymentData.clientName}.pdf`);

    // 2. WhatsApp Message Link
    const message = `*PAYMENT RECEIPT* ✅%0A--------------------------%0AHello *${paymentData.clientName}*,%0A%0AWe have successfully received your payment of *₹${paymentData.paidAmount}*.%0A%0A💰 *Total Deal:* ₹${paymentData.totalAmount}%0A💵 *Paid Amount:* ₹${paymentData.paidAmount}%0A⏳ *Balance Due:* ₹${remaining}%0A%0A_Thank you for choosing Indian Traders Academy!_`;
    
    window.open(`https://wa.me/${paymentData.clientPhone}?text=${message}`, "_blank");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.clientPhone.length < 10) return toast.error("Enter valid WhatsApp number");
    
    setLoading(true);
    try {
      const res = await createPayment(form);
      toast.success("Payment recorded successfully!");
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
    <div className="min-h-screen bg-slate-50 py-4 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/payments/my" className="inline-flex items-center text-indigo-600 font-bold mb-4 sm:mb-6 hover:translate-x-[-4px] transition-transform p-2">
          <FiArrowLeft className="mr-2" /> <span className="text-sm sm:text-base">Back to Dashboard</span>
        </Link>

        <div className="bg-white shadow-xl sm:shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 px-6 py-6 sm:px-8 sm:py-8 text-white">
            <h2 className="text-xl sm:text-3xl font-black italic uppercase tracking-widest">
              Add Collection
            </h2>
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
                  type="tel"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 bg-indigo-50/50 rounded-[1.2rem] sm:rounded-[1.5rem] border border-indigo-100">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase ml-2">Total Amount</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="totalAmount"
                  value={form.totalAmount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-none rounded-xl font-black text-base sm:text-lg text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">Currently Paid</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-none rounded-xl font-black text-base sm:text-lg text-emerald-600"
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between px-5 py-4 bg-slate-900 rounded-2xl text-white">
                <div>
                   <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest">Remaining</p>
                   <p className={`text-xl sm:text-2xl font-black ${pending > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                     ₹{pending || 0}
                   </p>
                </div>
                {pending > 0 && (
                  <span className="text-[8px] sm:text-[10px] font-black bg-orange-500/20 text-orange-400 px-2 sm:px-3 py-1 rounded-full border border-orange-500/30 uppercase">
                    Part Pay
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
                  <option value="upi">UPI / Online</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="card">Card Payment</option>
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
                placeholder="Any remarks..."
                onChange={handleChange}
                value={form.notes}
                rows="2"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Recording..." : <><FiSave size={18} /> Confirm & Receipt</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}