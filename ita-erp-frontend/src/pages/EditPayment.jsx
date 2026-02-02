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
  FiFileText,
  FiPhone,
  FiDollarSign,
  FiShare2
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "", // Added for WhatsApp
    companyName: "",
    totalAmount: "",
    paidAmount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: ""
  });

  // Fetch existing payment data
  useEffect(() => {
    getPaymentById(id)
      .then((res) => {
        setForm({
          clientName: res.data.clientName,
          clientPhone: res.data.clientPhone || "", // Populate Phone
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

  // ✅ RECEIPT GENERATION LOGIC (For re-sending after update)
  const handleReceiptAndWhatsApp = (data) => {
    const remaining = Number(data.totalAmount) - Number(data.paidAmount);
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text("UPDATED PAYMENT RECEIPT", 105, 20, { align: "center" });

    autoTable(doc, {
      startY: 40,
      head: [["Description", "Details"]],
      body: [
        ["Client Name", data.clientName],
        ["Workshop Name", data.companyName || "N/A"],
        ["Total Amount", `INR ${data.totalAmount}`],
        ["Amount Paid", `INR ${data.paidAmount}`],
        ["Remaining Balance", `INR ${remaining}`],
        ["Mode", data.paymentMode.toUpperCase()],
      ],
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Updated_Receipt_${data.clientName}.pdf`);

    const message = `*UPDATED PAYMENT RECEIPT* ✅%0A--------------------------%0AHello *${data.clientName}*,%0AYour payment record has been updated.%0A%0A💰 *Total Deal:* ₹${data.totalAmount}%0A💵 *Currently Paid:* ₹${data.paidAmount}%0A⏳ *Remaining Balance:* ₹${remaining}%0A%0A_Thank you!_`;
    window.open(`https://wa.me/${data.clientPhone}?text=${message}`, "_blank");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updatePayment(id, form);
      toast.success("Payment record updated!");
      
      // Ask user if they want to re-send the receipt
      if(window.confirm("Record updated. Would you like to send the updated receipt to WhatsApp?")) {
          handleReceiptAndWhatsApp(res.data);
      }
      
      navigate("/payments/my");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  const pending = Number(form.totalAmount) - Number(form.paidAmount);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/payments/my" className="inline-flex items-center text-slate-500 font-bold mb-6 hover:text-indigo-600 transition-colors">
          <FiArrowLeft className="mr-2" /> BACK TO LEDGER
        </Link>

        <div className="bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 px-8 py-8 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-widest">
                Edit Payment
              </h2>
              <p className="text-indigo-100 text-[10px] font-bold uppercase mt-1">Ref ID: {id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-indigo-200 uppercase">Balance Due</p>
                <p className="text-2xl font-black">₹{pending || 0}</p>
            </div>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            {/* Client + Phone */}
            <div className="grid md:grid-cols-2 gap-6">
              <InputField label="Client Name" name="clientName" value={form.clientName} icon={<FiUser />} onChange={handleChange} required />
              <InputField label="WhatsApp Number" name="clientPhone" value={form.clientPhone} icon={<FiPhone />} onChange={handleChange} required />
            </div>

            <InputField label="Workshop Name" name="companyName" value={form.companyName} icon={<FiBriefcase />} onChange={handleChange} />

            {/* Financials Breakdown */}
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Total Amount</label>
                  <input type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} required className="w-full p-4 bg-white border-none rounded-2xl font-black text-lg text-slate-700 shadow-sm" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">Paid Amount</label>
                  <input type="number" name="paidAmount" value={form.paidAmount} onChange={handleChange} required className="w-full p-4 bg-white border-none rounded-2xl font-black text-lg text-emerald-600 shadow-sm" />
               </div>
            </div>

            {/* Status Visuals */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${pending > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${pending > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                     <FiDollarSign />
                  </div>
                  <p className="text-xs font-black uppercase text-slate-600">
                     {pending > 0 ? "Part Payment Active" : "Fully Cleared"}
                  </p>
               </div>
               <p className="font-black text-slate-900 text-sm">₹{pending} Remaining</p>
            </div>

            {/* Mode & Reference */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Online</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <InputField label="Reference / Transaction ID" name="referenceId" value={form.referenceId} icon={<FiHash />} onChange={handleChange} />
            </div>

            <InputField label="Notes & Remarks" name="notes" value={form.notes} icon={<FiFileText />} onChange={handleChange} isTextArea />

            <button
              disabled={loading}
              className="w-full py-5 rounded-[1.5rem] bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all flex justify-center items-center gap-3 active:scale-95"
            >
              {loading ? "Syncing..." : <><FiRefreshCw className={loading ? "animate-spin" : ""} /> Update & Synchronize</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 🔹 Sub-component for clean form inputs
function InputField({ label, icon, isTextArea, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
        {icon} {label}
      </label>
      {isTextArea ? (
        <textarea {...props} rows="3" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500" />
      ) : (
        <input {...props} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500" />
      )}
    </div>
  );
}