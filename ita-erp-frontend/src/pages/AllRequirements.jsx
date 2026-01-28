import { useEffect, useState } from "react";
import { getAllRequirements, updateRequirementStatus } from "../services/requirementService";
import { toast } from "react-hot-toast";

export default function AllRequirements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await getAllRequirements();
      setList(res.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    await updateRequirementStatus(id, { status });
    toast.success(`Requirement ${status}`);
    loadData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Employee Requirements</h2>
        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-medium">
          {list.length} Total Requirements
        </span>
      </div>

      {/* Mobile View: Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {list.map((r) => (
          <div key={r._id} className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</p>
                <p className="font-medium text-gray-900">{r.user?.name || "Unknown"}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(r.status)}`}>
                {r.status}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-600"><span className="font-semibold">Title:</span> {r.title}</p>
              <p className="text-sm text-gray-600"><span className="font-semibold">Category:</span> {r.category}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => updateStatus(r._id, "Approved")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Approve
              </button>
              <button 
                onClick={() => updateStatus(r._id, "Rejected")}
                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Clean Table */}
      <div className="hidden md:block overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Requirements Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{r.user?.name}</div>
                  <div className="text-xs text-gray-400">ID: {r._id.slice(-6)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-800">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.category}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{r.priority}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => updateStatus(r._id, "Approved")}
                      className="text-green-600 hover:text-green-800 text-sm font-semibold"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => updateStatus(r._id, "Rejected")}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}