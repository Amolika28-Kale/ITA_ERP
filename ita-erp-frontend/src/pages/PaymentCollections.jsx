import { useEffect, useState } from "react";
import { getAllPayments } from "../services/paymentCollectionService";
import { FiUsers, FiDollarSign, FiSearch, FiFilter, FiDownload } from "react-icons/fi";

export default function PaymentCollections() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    getAllPayments()
      .then((res) => {
        setList(res.data);
        setFilteredList(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Handle Filtering Logic
  useEffect(() => {
    let result = list;

    if (searchTerm) {
      result = result.filter(p => 
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (modeFilter !== "all") {
      result = result.filter(p => p.paymentMode === modeFilter);
    }

    setFilteredList(result);
  }, [searchTerm, modeFilter, list]);

  // Function to Export CSV
  const exportToCSV = () => {
    const headers = ["Employee,Client,Company,Amount,Mode,Date\n"];
    const rows = filteredList.map(p => 
      `${p.employee?.name || 'N/A'},${p.clientName},${p.companyName || '-'},${p.amount},${p.paymentMode},${new Date(p.collectionDate).toLocaleDateString()}\n`
    );
    const blob = new Blob([headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "payment_collections.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalAmount = filteredList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">All Collections</h2>
            <p className="text-slate-500 mt-1">Manage and export organization-wide payments.</p>
          </div>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Stats & Filters Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Search Input */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Search Records</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Client or Employee name..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Payment Mode</label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                  onChange={(e) => setModeFilter(e.target.value)}
                >
                  <option value="all">All Modes</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Total Display */}
            <div className="bg-indigo-600 rounded-xl p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiDollarSign className="opacity-70" />
                <span className="text-sm font-medium">Filtered Total:</span>
              </div>
              <span className="text-xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

          </div>
        </div>

        {/* Table/List View */}
        {loading ? (
          <div className="flex justify-center py-20 animate-pulse text-slate-400">Loading data...</div>
        ) : filteredList.length > 0 ? (
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mode</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">{p.employee?.name || "N/A"}</td>
                      <td className="px-6 py-4 text-slate-900">{p.clientName}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 capitalize text-sm text-slate-500">{p.paymentMode}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{new Date(p.collectionDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredList.map((p) => (
                <div key={p._id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{p.clientName}</p>
                    <p className="text-xs text-slate-500">By: {p.employee?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">₹{p.amount}</p>
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{p.paymentMode}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
            No records match your search.
          </div>
        )}
      </div>
    </div>
  );
}