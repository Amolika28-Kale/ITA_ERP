import { useEffect, useState } from "react";
import { getAllPayments } from "../services/paymentCollectionService";
import {
  FiUsers,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPieChart,
  FiTrendingUp
} from "react-icons/fi";

export default function PaymentCollections() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    getAllPayments()
      .then((res) => {
        setList(res.data);
        setFilteredList(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* 🔎 Advanced Filtering */
  useEffect(() => {
    let result = list;

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (modeFilter !== "all") {
      result = result.filter((p) => p.paymentMode === modeFilter);
    }

    setFilteredList(result);
  }, [searchTerm, modeFilter, list]);

  /* 📤 Export Detailed CSV */
  const exportToCSV = () => {
    const headers = "Employee,Client,Workshop,Total Deal,Currently Paid,Remaining Balance,Mode,Date\n";

    const rows = filteredList.map((p) => {
      const pending = Number(p.totalAmount) - Number(p.paidAmount);
      return `${p.employee?.name || "N/A"},${p.clientName},${
        p.companyName || "General"
      },${p.totalAmount},${p.paidAmount},${pending},${
        p.paymentMode.toUpperCase()
      },${new Date(p.collectionDate).toLocaleDateString()}\n`;
    });

    const blob = new Blob([headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Master_Collections_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalCollected = filteredList.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
  const totalPending = filteredList.reduce((sum, p) => sum + (Number(p.totalAmount) - Number(p.paidAmount)), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">
              Organization <span className="text-indigo-600">Ledger</span>
            </h2>
            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" />
              Auditing {filteredList.length} global transactions
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            <FiDownload /> Export Master CSV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Global Collection" value={`₹${totalCollected.toLocaleString("en-IN")}`} icon={<FiDollarSign />} color="bg-emerald-500" />
          <StatCard title="Total Outstanding" value={`₹${totalPending.toLocaleString("en-IN")}`} icon={<FiPieChart />} color="bg-rose-500" />
          <StatCard title="Total Records" value={filteredList.length} icon={<FiUsers />} color="bg-indigo-500" />
        </div>

        {/* Command Bar */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-8 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Search Ledger</label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500"
                  placeholder="Filter by Client, Workshop or Employee name..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mode Filter</label>
              <select
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setModeFilter(e.target.value)}
              >
                <option value="all">All Channels</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI / Online</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Table */}
        {loading ? (
          <div className="flex justify-center py-20 animate-pulse font-black text-slate-300 uppercase tracking-[0.3em]">
            Syncing Ledger...
          </div>
        ) : filteredList.length > 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400">Handled By</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400">Client / Workshop</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 text-center">Total Deal</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 text-center">Currently Paid</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 text-center">Remaining</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredList.map((p) => {
                    const remaining = Number(p.totalAmount) - Number(p.paidAmount);
                    return (
                      <tr key={p._id} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                              {p.employee?.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{p.employee?.name || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-900 leading-none mb-1">{p.clientName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.companyName || "N/A"}</div>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-slate-500">₹{p.totalAmount.toLocaleString("en-IN")}</td>
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-black text-sm">
                            ₹{p.paidAmount.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`font-black text-sm ${remaining > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                            ₹{remaining.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase leading-none">{p.paymentMode}</div>
                          <div className="text-[11px] font-bold text-slate-800 mt-1">{new Date(p.collectionDate).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest italic">Zero ledger entries found</h3>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] flex items-center gap-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
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