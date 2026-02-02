import { useEffect, useState } from "react";
import { getMyPayments, deletePayment } from "../services/paymentCollectionService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FiPlus, FiTrash2, FiCalendar, FiEdit, 
  FiSearch, FiTrendingUp, FiDollarSign, FiPieChart, FiShare2 
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MyPayments() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getMyPayments()
      .then((res) => {
        setList(res.data || []);
        setFilteredList(res.data || []);
      })
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  /* 🔍 Search Logic */
  useEffect(() => {
    const filtered = list.filter(p =>
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentMode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredList(filtered);
  }, [searchQuery, list]);

  /* ❌ Delete Logic */
  const remove = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await deletePayment(id);
      toast.success("Payment deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* 📄 Receipt & WhatsApp Logic */
  const shareReceipt = (p) => {
    const remaining = Number(p.totalAmount) - Number(p.paidAmount);
    
    // 1. Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Receipt ID: ${p._id.slice(-6).toUpperCase()}`, 14, 35);
    doc.text(`Date: ${new Date(p.collectionDate).toLocaleDateString()}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [["Description", "Details"]],
      body: [
        ["Client Name", p.clientName],
        ["Workshop", p.companyName || "General"],
        ["Total Deal Amount", `INR ${p.totalAmount}`],
        ["Amount Paid Today", `INR ${p.paidAmount}`],
        ["Remaining Balance", `INR ${remaining}`],
        ["Payment Mode", p.paymentMode.toUpperCase()],
      ],
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Receipt_${p.clientName}.pdf`);

    // 2. Open WhatsApp
    const message = `*PAYMENT RECEIPT*%0A--------------------------%0AHello *${p.clientName}*,%0A%0AWe have successfully received your payment of *₹${p.paidAmount}*.%0A%0A💰 *Total Deal:* ₹${p.totalAmount}%0A💵 *Paid Amount:* ₹${p.paidAmount}%0A⏳ *Balance Due:* ₹${remaining}%0A%0A_Thank you for your business!_`;
    
    // Assuming phone number is stored in p.clientPhone or similar
    // If phone isn't in record, it opens a generic share
    window.open(`https://wa.me/${p.clientPhone || ''}?text=${message}`, "_blank");
  };

  /* 📊 Stats Calculation */
  const totalCollected = filteredList.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
  const avgPayment = filteredList.length > 0 ? Math.round(totalCollected / filteredList.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">
              Payment <span className="text-indigo-600">Ledger</span>
            </h2>
            <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
              <FiTrendingUp className="text-emerald-500" />
              Tracking {filteredList.length} collections
            </p>
          </div>

          <Link
            to="/payments/add"
            className="px-8 py-4 rounded-2xl text-white bg-indigo-600 hover:bg-slate-900 font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 transition-all active:scale-95"
          >
            <FiPlus /> New Collection
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString("en-IN")}`} icon={<FiDollarSign />} color="bg-emerald-500" />
          <StatCard title="Avg Transaction" value={`₹${avgPayment.toLocaleString("en-IN")}`} icon={<FiPieChart />} color="bg-indigo-500" />
          <StatCard title="Transactions" value={filteredList.length} icon={<FiCalendar />} color="bg-amber-500" />
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            placeholder="Search by client name or mode..."
            className="w-full pl-14 pr-4 py-5 rounded-[1.5rem] bg-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CONTENT TABLE */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full" />
          </div>
        ) : filteredList.length ? (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Workshop</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Amount</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Currently Paid</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Remaining</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Mode</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {filteredList.map((p) => {
                    const remaining = Number(p.totalAmount) - Number(p.paidAmount);
                    return (
                      <tr key={p._id} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-800">{p.clientName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {p.companyName || "N/A"}
                          </div>
                        </td>

                        {/* ✅ Total Payment Column */}
                        <td className="px-8 py-6 text-center font-bold text-slate-500">
                          ₹{p.totalAmount.toLocaleString("en-IN")}
                        </td>

                        {/* ✅ Currently Paid Column */}
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-black text-sm border border-emerald-100">
                            ₹{p.paidAmount.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* ✅ Remaining Balance Column */}
                        <td className="px-8 py-6 text-center">
                          <span className={`font-black text-sm ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            ₹{remaining.toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td className="px-8 py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getModeStyles(p.paymentMode)}`}>
                            {p.paymentMode}
                          </span>
                        </td>

                        <td className="px-8 py-6 text-right space-x-2">
                          <button
                            onClick={() => shareReceipt(p)}
                            title="Generate Receipt & WhatsApp"
                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiShare2 size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/payments/edit/${p._id}`)}
                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => remove(p._id)}
                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <FiDollarSign size={40} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No transactions found</h3>
          </div>
        )}
      </div>
    </div>
  );
}

/* 🔹 Reusable Stat Card */
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] flex items-center gap-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all">
      <div className={`${color} w-16 h-16 rounded-2xl text-white flex items-center justify-center text-3xl shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

/* 🎨 Conditional Mode Styles */
function getModeStyles(mode) {
  const m = mode?.toLowerCase();
  if (m === "cash") return "bg-amber-100 text-amber-700 border-amber-200";
  if (m === "upi") return "bg-purple-100 text-purple-700 border-purple-200";
  if (m === "bank") return "bg-sky-100 text-sky-700 border-sky-200";
  return "bg-slate-100 text-slate-600";
}