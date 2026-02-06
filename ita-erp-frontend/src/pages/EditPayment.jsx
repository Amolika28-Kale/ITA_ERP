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
  FiDollarSign
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
    clientPhone: "",
    companyName: "",
    totalAmount: "",
    paidAmount: "",
    paymentMode: "cash",
    referenceId: "",
    notes: ""
  });

  useEffect(() => {
    getPaymentById(id)
      .then((res) => {
        setForm({
          clientName: res.data.clientName,
          clientPhone: res.data.clientPhone || "",
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

// ✅ RECEIPT GENERATION LOGIC (With Terms & Thank You Message)
  const handleReceiptAndWhatsApp = (data) => {
    const remaining = Number(data.totalAmount) - Number(data.paidAmount);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text("UPDATED PAYMENT RECEIPT", 105, 20, { align: "center" });

    // Table
    autoTable(doc, {
      startY: 35,
      head: [["Description", "Details"]],
      body: [
        ["Client Name", data.clientName],
        ["Workshop Name", data.companyName || "N/A"],
        ["Total Deal Amount", `INR ${data.totalAmount.toLocaleString("en-IN")}`],
        ["Amount Paid Today", `INR ${data.paidAmount.toLocaleString("en-IN")}`],
        ["Remaining Balance", `INR ${remaining.toLocaleString("en-IN")}`],
        ["Payment Mode", data.paymentMode.toUpperCase()],
        ["Reference ID", data.referenceId || "N/A"],
      ],
      headStyles: { fillColor: [79, 70, 229] },
      styles: { cellPadding: 5, fontSize: 10 },
    });

    // Position after table
    let finalY = doc.lastAutoTable.finalY + 15;

    // ✅ ३. Thank You Message
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // Dark Slate
    doc.text("Thank you for choosing Indian Traders Academy.", 105, finalY, { align: "center" });

    // ✅ २. Terms & Conditions Section
    finalY += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", 14, finalY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const terms = [
      "1. All payments made to Indian Traders Academy are non-refundable.",
      "2. This receipt is valid only for the specific workshop/course duration only.",
      "3. Access to premium materials is subject to completion of total payment.",
      "4. This is a computer-generated receipt and does not require a physical signature."
    ];

    terms.forEach((line, index) => {
      doc.text(line, 14, finalY + 6 + (index * 5));
    });

    doc.save(`Updated_Receipt_${data.clientName}.pdf`);

    // WhatsApp Message
    const message = `*UPDATED PAYMENT RECEIPT* ✅%0A--------------------------%0AHello *${data.clientName}*,%0AYour payment record has been updated.%0A%0A💰 *Total Deal:* ₹${data.totalAmount.toLocaleString("en-IN")}%0A💵 *Currently Paid:* ₹${data.paidAmount.toLocaleString("en-IN")}%0A⏳ *Remaining Balance:* ₹${remaining.toLocaleString("en-IN")}%0A%0A_Thank you for choosing Indian Traders Academy!_`;
    window.open(`https://wa.me/${data.clientPhone}?text=${message}`, "_blank");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updatePayment(id, form);
      toast.success("Payment record updated!");
      
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
        <div className="animate-spin h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  const pending = Number(form.totalAmount) - Number(form.paidAmount);

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-3 md:px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/payments/my" className="inline-flex items-center text-slate-500 font-bold mb-6 hover:text-indigo-600 transition-colors p-2">
          <FiArrowLeft className="mr-2" /> <span className="text-[10px] tracking-widest uppercase">Back to Ledger</span>
        </Link>

        <div className="bg-white shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100">
          {/* Header Section - Adaptive for Mobile */}
          <div className="bg-indigo-600 px-6 py-6 md:px-8 md:py-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-widest">
                Edit Payment
              </h2>
              <p className="text-indigo-100 text-[8px] md:text-[10px] font-black uppercase mt-1 tracking-tighter">ID: {id.toUpperCase()}</p>
            </div>
            <div className="flex md:block flex-row items-center justify-between w-full md:w-auto bg-indigo-700/50 md:bg-transparent p-3 md:p-0 rounded-xl">
                <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest md:mb-1">Balance Due</p>
                <p className="text-xl md:text-2xl font-black">₹{pending.toLocaleString("en-IN") || 0}</p>
            </div>
          </div>

          <form onSubmit={submit} className="p-5 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InputField label="Client Name" name="clientName" value={form.clientName} icon={<FiUser />} onChange={handleChange} required />
              <InputField label="WhatsApp Number" name="clientPhone" type="tel" value={form.clientPhone} icon={<FiPhone />} onChange={handleChange} required />
            </div>

            <InputField label="Workshop Name" name="companyName" value={form.companyName} icon={<FiBriefcase />} onChange={handleChange} />

            {/* Financials Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Total Deal</label>
                  <input type="number" inputMode="decimal" name="totalAmount" value={form.totalAmount} onChange={handleChange} required className="w-full p-4 bg-white border-none rounded-xl md:rounded-2xl font-black text-lg text-slate-700 shadow-sm" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">Currently Paid</label>
                  <input type="number" inputMode="decimal" name="paidAmount" value={form.paidAmount} onChange={handleChange} required className="w-full p-4 bg-white border-none rounded-xl md:rounded-2xl font-black text-lg text-emerald-600 shadow-sm" />
               </div>
            </div>

            {/* Status Visuals - Compact on Mobile */}
            <div className={`p-4 rounded-xl md:rounded-2xl border flex items-center justify-between ${pending > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${pending > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                     <FiDollarSign size={14} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">
                     {pending > 0 ? "Part Payment" : "Settled"}
                  </p>
               </div>
               <p className="font-black text-slate-900 text-xs md:text-sm">₹{pending.toLocaleString("en-IN")} Due</p>
            </div>

            {/* Mode & Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Online</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="bank">Card Transfer</option>


                </select>
              </div>
              <InputField label="Transaction ID" name="referenceId" value={form.referenceId} icon={<FiHash />} onChange={handleChange} />
            </div>

            <InputField label="Internal Remarks" name="notes" value={form.notes} icon={<FiFileText />} onChange={handleChange} isTextArea />

            <button
              disabled={loading}
              className="w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <FiRefreshCw className="animate-spin" />
              ) : (
                <> <FiRefreshCw /> Update Record </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, isTextArea, type = "text", ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1 tracking-widest">
        {icon} {label}
      </label>
      {isTextArea ? (
        <textarea {...props} rows="3" className="w-full p-4 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
      ) : (
        <input type={type} {...props} className="w-full p-4 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
      )}
    </div>
  );
}