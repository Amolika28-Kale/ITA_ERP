import { useEffect, useState } from "react";
import { getAllPayments } from "../services/paymentCollectionService";
import {
  FiUsers,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiDownload
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

  /* 🔎 Filtering */
  useEffect(() => {
    let result = list;

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.clientName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.employee?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (modeFilter !== "all") {
      result = result.filter((p) => p.paymentMode === modeFilter);
    }

    setFilteredList(result);
  }, [searchTerm, modeFilter, list]);

  /* 📤 Export CSV */
  const exportToCSV = () => {
    const headers =
      "Employee,Client,Company,Total,Paid,Pending,Mode,Date\n";

    const rows = filteredList.map((p) => {
      const pending =
        Number(p.totalAmount) - Number(p.paidAmount);

      return `${p.employee?.name || "N/A"},${p.clientName},${
        p.companyName || "-"
      },${p.totalAmount},${p.paidAmount},${pending},${
        p.paymentMode
      },${new Date(p.collectionDate).toLocaleDateString()}\n`;
    });

    const blob = new Blob([headers, ...rows], {
      type: "text/csv"
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment_collections.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalCollected = filteredList.reduce(
    (sum, p) => sum + Number(p.paidAmount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              All Collections
            </h2>
            <p className="text-slate-500 mt-1">
              Organization-wide payment records
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-50"
          >
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

            {/* Search */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full pl-10 pr-4 py-2 border rounded-xl"
                  placeholder="Client / Employee"
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Payment Mode
              </label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white"
                  onChange={(e) =>
                    setModeFilter(e.target.value)
                  }
                >
                  <option value="all">All</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
            </div>

            {/* Total */}
            <div className="bg-indigo-600 rounded-xl p-3 text-white flex justify-between">
              <span className="flex items-center gap-2">
                <FiDollarSign /> Collected
              </span>
              <span className="text-xl font-bold">
                ₹{totalCollected.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Loading...
          </div>
        ) : filteredList.length > 0 ? (
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">
                      Client
                    </th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">
                      Paid
                    </th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">
                      Pending
                    </th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">
                      Mode
                    </th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredList.map((p) => {
                    const pending =
                      Number(p.totalAmount) -
                      Number(p.paidAmount);

                    return (
                      <tr key={p._id}>
                        <td className="px-6 py-4">
                          {p.employee?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {p.clientName}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          ₹{p.paidAmount}
                        </td>
                        <td className="px-6 py-4">
                          {pending > 0 ? (
                            <span className="text-orange-600 font-bold">
                              ₹{pending}
                            </span>
                          ) : (
                            <span className="text-green-600 font-bold">
                              ₹0
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {p.paymentMode}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(
                            p.collectionDate
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed text-slate-400">
            No matching records
          </div>
        )}
      </div>
    </div>
  );
}
