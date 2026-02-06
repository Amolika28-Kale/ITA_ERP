import { useEffect, useState } from "react";
import { getMyPayments } from "../services/paymentCollectionService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FiPlus, FiCalendar, FiEdit, 
  FiSearch, FiTrendingUp, FiDollarSign, FiPieChart, FiShare2, FiBriefcase
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

  useEffect(() => {
    const filtered = list.filter(p =>
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentMode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredList(filtered);
  }, [searchQuery, list]);

 /* 📄 Updated Receipt Logic with Terms & Thank You Message */
  const shareReceipt = (p) => {
    const remaining = Number(p.totalAmount) - Number(p.paidAmount);
    
    // 1. Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Receipt ID: ${p._id.slice(-6).toUpperCase()}`, 14, 35);
    doc.text(`Date: ${new Date(p.collectionDate).toLocaleDateString()}`, 14, 40);

    // Table
    autoTable(doc, {
      startY: 50,
      head: [["Description", "Details"]],
      body: [
        ["Client Name", p.clientName],
        ["Workshop", p.companyName || "General"],
        ["Total Deal Amount", `INR ${p.totalAmount.toLocaleString("en-IN")}`],
        ["Amount Paid Today", `INR ${p.paidAmount.toLocaleString("en-IN")}`],
        ["Remaining Balance", `INR ${remaining.toLocaleString("en-IN")}`],
        ["Payment Mode", p.paymentMode.toUpperCase()],
      ],
      headStyles: { fillColor: [79, 70, 229] },
      styles: { cellPadding: 5 }
    });

    // Final position after table
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
    doc.setTextColor(30, 41, 59);
    doc.text("Terms & Conditions:", 14, finalY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const terms = [
      "1. All payments are non-refundable and non-transferable.",
      "2. This receipt is valid for the specific workshop/course duration only.",
      "3. Access to premium materials is provided after full payment clearance.",
      "4. This is a computer-generated document and requires no physical signature."
    ];

    terms.forEach((line, index) => {
      doc.text(line, 14, finalY + 6 + (index * 5));
    });

    // Save PDF
    doc.save(`Receipt_${p.clientName}.pdf`);

    // 2. Open WhatsApp with Updated Message
    const message = `*PAYMENT RECEIPT* ✅%0A--------------------------%0AHello *${p.clientName}*,%0A%0AWe have successfully received your payment of *₹${p.paidAmount.toLocaleString("en-IN")}*.%0A%0A💰 *Total Deal:* ₹${p.totalAmount.toLocaleString("en-IN")}%0A💵 *Paid Amount:* ₹${p.paidAmount.toLocaleString("en-IN")}%0A⏳ *Balance Due:* ₹${remaining.toLocaleString("en-IN")}%0A%0A_Thank you for choosing Indian Traders Academy!_`;
    
    window.open(`https://wa.me/${p.clientPhone || ''}?text=${message}`, "_blank");
  };

  const totalCollected = filteredList.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
  const avgPayment = filteredList.length > 0 ? Math.round(totalCollected / filteredList.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between mb-8 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Payment <span className="text-indigo-600">Ledger</span>
            </h2>
            <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2 font-medium">
              <FiTrendingUp className="text-emerald-500" />
              Tracking {filteredList.length} collections
            </p>
          </div>

          <Link
            to="/payments/add"
            className="w-full md:w-auto px-8 py-4 rounded-2xl text-white bg-indigo-600 hover:bg-slate-900 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FiPlus size={18} /> New Collection
          </Link>
        </div>

        {/* STATS CARDS (Scrollable on mobile) */}
        <div className="flex md:grid md:grid-cols-3 gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
          <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString("en-IN")}`} icon={<FiDollarSign />} color="bg-emerald-500" />
          <StatCard title="Avg Transaction" value={`₹${avgPayment.toLocaleString("en-IN")}`} icon={<FiPieChart />} color="bg-indigo-500" />
          <StatCard title="Count" value={filteredList.length} icon={<FiCalendar />} color="bg-amber-500" />
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="Search client or mode..."
            className="w-full pl-12 pr-4 py-4 md:py-5 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center py-20 animate-pulse">
             <p className="text-xs font-black uppercase text-slate-300 tracking-[0.3em]">Syncing Ledger...</p>
          </div>
        ) : filteredList.length ? (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <tr>
                    <th className="px-8 py-5 text-left">Client & Workshop</th>
                    <th className="px-8 py-5 text-center">Total Deal</th>
                    <th className="px-8 py-5 text-center">Paid</th>
                    <th className="px-8 py-5 text-center">Remaining</th>
                    <th className="px-8 py-5 text-center">Mode</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredList.map((p) => (
                    <DesktopRow key={p._id} p={p} shareReceipt={shareReceipt} navigate={navigate} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST (Cards) */}
            <div className="md:hidden space-y-4 pb-20">
              {filteredList.map((p) => (
                <MobileCard key={p._id} p={p} shareReceipt={shareReceipt} navigate={navigate} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <h3 className="text-sm font-black text-slate-300 uppercase italic">Zero Entries Found</h3>
          </div>
        )}
      </div>
    </div>
  );
}

/* 🔹 Desktop Table Row */
function DesktopRow({ p, shareReceipt, navigate }) {
  const remaining = Number(p.totalAmount) - Number(p.paidAmount);
  return (
    <tr className="hover:bg-indigo-50/30 transition-all">
      <td className="px-8 py-6">
        <div className="font-black text-slate-800">{p.clientName}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.companyName || "General"}</div>
      </td>
      <td className="px-8 py-6 text-center font-bold text-slate-500 text-sm">₹{p.totalAmount.toLocaleString("en-IN")}</td>
      <td className="px-8 py-6 text-center">
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-black text-sm">₹{p.paidAmount.toLocaleString("en-IN")}</span>
      </td>
      <td className="px-8 py-6 text-center">
        <span className={`font-black text-sm ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{remaining.toLocaleString("en-IN")}</span>
      </td>
      <td className="px-8 py-6 text-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getModeStyles(p.paymentMode)}`}>{p.paymentMode}</span>
      </td>
      <td className="px-8 py-6 text-right space-x-2">
        <button onClick={() => shareReceipt(p)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><FiShare2 size={16} /></button>
        <button onClick={() => navigate(`/payments/edit/${p._id}`)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><FiEdit size={16} /></button>
      </td>
    </tr>
  );
}

/* 🔹 Mobile Payment Card */
function MobileCard({ p, shareReceipt, navigate }) {
  const remaining = Number(p.totalAmount) - Number(p.paidAmount);
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-slate-800 text-lg leading-tight">{p.clientName}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
            <FiBriefcase size={10} /> {p.companyName || "General"}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getModeStyles(p.paymentMode)}`}>
          {p.paymentMode}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl mb-4">
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Deal</p>
          <p className="text-sm font-black text-slate-600">₹{p.totalAmount.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Remaining</p>
          <p className={`text-sm font-black ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            ₹{remaining.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
           <p className="text-[8px] font-black text-emerald-400 uppercase">Currently Paid</p>
           <p className="text-base font-black text-emerald-600">₹{p.paidAmount.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => shareReceipt(p)} className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100"><FiShare2 size={20} /></button>
           <button onClick={() => navigate(`/payments/edit/${p._id}`)} className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-100"><FiEdit size={20} /></button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-sm border border-slate-100 min-w-[240px] md:min-w-0 snap-center">
      <div className={`${color} w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl text-white flex items-center justify-center text-xl md:text-3xl shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function getModeStyles(mode) {
  const m = mode?.toLowerCase();
  if (m === "cash") return "bg-amber-100 text-amber-700 border-amber-200";
  if (m === "upi") return "bg-purple-100 text-purple-700 border-purple-200";
  if (m === "bank") return "bg-sky-100 text-sky-700 border-sky-200";
  return "bg-slate-100 text-slate-600";
}