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
        setList(res.data || []);
        setFilteredList(res.data || []);
      })
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  /* 🔍 Search */
  useEffect(() => {
    const filtered = list.filter(p =>
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentMode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredList(filtered);
  }, [searchQuery, list]);

  /* ❌ Delete */
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

  /* 📊 Stats */
  const totalCollected = filteredList.reduce(
    (sum, p) => sum + Number(p.paidAmount || 0),
    0
  );

  const avgPayment =
    filteredList.length > 0
      ? Math.round(totalCollected / filteredList.length)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black">Collections Dashboard</h2>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" />
              Managing {filteredList.length} transactions
            </p>
          </div>

          <Link
            to="/payments/add"
            className="px-6 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center gap-2"
          >
            <FiPlus /> New Collection
          </Link>
        </div>

        {/* STATS */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Collected"
            value={`₹${totalCollected.toLocaleString("en-IN")}`}
            icon={<FiDollarSign />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Avg Transaction"
            value={`₹${avgPayment.toLocaleString("en-IN")}`}
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

        {/* SEARCH */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by client or mode..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
        ) : filteredList.length ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-left">Client</th>
                    <th className="px-8 py-4">Amount</th>
                    <th className="px-8 py-4">Mode</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredList.map((p) => (
                    <tr key={p._id} className="border-t hover:bg-indigo-50/20">
                      <td className="px-8 py-5">
                        <div className="font-bold">{p.clientName}</div>
                        <div className="text-xs text-slate-400">
                          {p.companyName || "Individual"}
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <p className="text-lg font-black text-emerald-600">
                          ₹{p.paidAmount?.toLocaleString("en-IN")}
                        </p>

                        {p.isPartPayment && (
                          <>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                              PART PAYMENT
                            </span>
                            <p className="text-xs text-slate-400">
                              Pending ₹{p.pendingAmount}
                            </p>
                          </>
                        )}
                      </td>

                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getModeStyles(p.paymentMode)}`}>
                          {p.paymentMode}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-slate-500">
                        {new Date(p.collectionDate).toLocaleDateString()}
                      </td>

                      <td className="px-8 py-5 text-right space-x-3">
                        <button
                          onClick={() => navigate(`/payments/edit/${p._id}`)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => remove(p._id)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-dashed border-4">
            <h3 className="text-2xl font-bold">No payments found</h3>
          </div>
        )}
      </div>
    </div>
  );
}

/* 🔹 Stat Card */
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl flex items-center gap-4 shadow">
      <div className={`${color} p-4 rounded-xl text-white text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

/* 🎨 Mode Color */
function getModeStyles(mode) {
  const m = mode?.toLowerCase();
  if (m === "cash") return "bg-amber-100 text-amber-700";
  if (m === "upi") return "bg-purple-100 text-purple-700";
  if (m === "bank") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-700";
}
