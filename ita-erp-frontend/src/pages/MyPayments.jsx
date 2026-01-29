import { useEffect, useState } from "react";
import { getMyPayments, deletePayment } from "../services/paymentCollectionService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FiPlus, FiTrash2, FiCalendar, FiCreditCard, FiEdit, 
  FiSearch, FiTrendingUp, FiDollarSign, FiPieChart 
} from "react-icons/fi";

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
        setList(res.data);
        setFilteredList(res.data);
      })
      .catch(err => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Handle Search Filtering
  useEffect(() => {
    const filtered = list.filter(p => 
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredList(filtered);
  }, [searchQuery, list]);

  const remove = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        await deletePayment(id);
        toast.success("Payment deleted");
        load();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  // Calculate Quick Stats
  const totalCollected = filteredList.reduce((sum, p) => sum + p.amount, 0);
  const avgPayment = filteredList.length > 0 ? (totalCollected / filteredList.length).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Collections Dashboard
            </h2>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" /> 
              Managing {filteredList.length} recent transactions
            </p>
          </div>
          <Link
            to="/payments/add"
            className="flex items-center justify-center px-6 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold active:scale-95"
          >
            <FiPlus className="mr-2 w-5 h-5" />
            New Collection
          </Link>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Amount" 
            value={`₹${totalCollected.toLocaleString('en-IN')}`} 
            icon={<FiDollarSign />} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Avg. Transaction" 
            value={`₹${Number(avgPayment).toLocaleString('en-IN')}`} 
            icon={<FiPieChart />} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Transactions" 
            value={filteredList.length} 
            icon={<FiCalendar />} 
            color="bg-amber-500" 
          />
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by client name or payment mode..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden border border-slate-100">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Mode</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-right font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredList.map((p) => (
                    <tr key={p._id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800 text-lg">{p.clientName}</div>
                        <div className="text-xs text-slate-400 font-medium tracking-tight uppercase">{p.companyName || 'Individual'}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xl font-black text-emerald-600 italic">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${getModeStyles(p.paymentMode)}`}>
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-medium">
                        {new Date(p.collectionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right space-x-3">
                        <button
                          onClick={() => navigate(`/payments/edit/${p._id}`)}
                          className="inline-flex items-center p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => remove(p._id)}
                          className="inline-flex items-center p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 divide-y divide-slate-50 md:hidden">
              {filteredList.map((p) => (
                <div key={p._id} className="p-6 bg-white hover:bg-slate-50 transition-colors relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 leading-tight">{p.clientName}</h4>
                      <p className="text-emerald-600 font-black text-2xl mt-2 tracking-tighter">₹{p.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={() => navigate(`/payments/edit/${p._id}`)} className="p-3 text-indigo-600 bg-indigo-50 rounded-2xl active:scale-90 transition-transform shadow-sm">
                        <FiEdit className="w-6 h-6" />
                      </button>
                      <button onClick={() => remove(p._id)} className="p-3 text-rose-600 bg-rose-50 rounded-2xl active:scale-90 transition-transform shadow-sm">
                        <FiTrash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getModeStyles(p.paymentMode)}`}>
                      <FiCreditCard className="w-3 h-3"/> {p.paymentMode}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                      <FiCalendar className="w-3 h-3"/> {new Date(p.collectionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 shadow-inner">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <FiDollarSign className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">No matching payments</h3>
            <p className="text-slate-400 mt-2 mb-8">Try adjusting your search or add a new record.</p>
            <Link to="/payments/add" className="text-indigo-600 font-black bg-indigo-50 px-8 py-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
              + New Payment Entry
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`${color} p-4 rounded-2xl text-white text-2xl shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

// Color Helper for Payment Modes
function getModeStyles(mode) {
  const m = mode?.toLowerCase();
  if (m === 'cash') return 'bg-amber-100 text-amber-700';
  if (m === 'upi') return 'bg-purple-100 text-purple-700';
  if (m === 'bank' || m === 'bank transfer') return 'bg-sky-100 text-sky-700';
  return 'bg-slate-100 text-slate-700';
}