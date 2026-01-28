import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequirements } from "../services/requirementService";
import { deleteRequirement } from "../services/requirementService";
import { toast } from "react-hot-toast";

export default function MyRequirements() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyRequirements().then((res) => setList(res.data));
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Requirements</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Track and manage your submitted requirements.</p>
        </div>

        <button
          onClick={() => navigate("/create-request")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Requirement
        </button>
      </div>

      {/* Content Area */}
      {list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">empty_icon</div>
          <h3 className="text-lg font-medium text-gray-900">No requests yet</h3>
          <p className="text-gray-500">When you submit a requirement, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {/* Desktop Header (Hidden on Mobile) */}
<div className="hidden md:grid md:grid-cols-6 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
  <div>Title</div>
  <div>Priority</div>
  <div>Status</div>
  <div className="col-span-2">Admin Remark</div>
  <div>Action</div>
</div>


          {/* List Items */}
      {list.map((r) => (
<div
  key={r._id}
  className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5
             md:grid md:grid-cols-6 md:items-center md:rounded-none md:border-none md:hover:bg-gray-50 transition-all"
>

    {/* Title & Category */}
<div className="mb-3 md:mb-0">
  <h4 className="font-bold text-gray-800 text-sm">{r.title}</h4>
  <span className="inline-block mt-1 text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">
    {r.category}
  </span>
</div>


    {/* Priority */}
<div className="mb-3 md:mb-0 text-sm text-gray-600">
  <span className="md:hidden font-semibold text-gray-500">Priority: </span>
  {r.priority}
</div>


    {/* Status */}
    <div className="mb-3 md:mb-0">
      <span
        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(
          r.status
        )}`}
      >
        {r.status}
      </span>
    </div>

    {/* Admin Remark */}
    <div className="col-span-2 text-sm text-gray-600 italic">
      {r.adminRemark ? `"${r.adminRemark}"` : "No remarks yet"}
    </div>

    {/* ACTION */}
<div className="flex gap-4 mt-4 md:mt-0">
  {r.status === "Pending" ? (
    <>
      <button
        onClick={() => navigate(`/edit-request/${r._id}`)}
        className="text-blue-600 font-semibold hover:underline"
      >
        Edit
      </button>

      <button
        onClick={async () => {
          if (!window.confirm("Delete this request?")) return;
          await deleteRequirement(r._id);
          toast.success("Requirement deleted 🗑️");
          setList(list.filter((x) => x._id !== r._id));
        }}
        className="text-red-600 font-semibold hover:underline"
      >
        Delete
      </button>
    </>
  ) : (
    <span className="text-gray-400 text-sm">Locked</span>
  )}
</div>

  </div>
))}

          
        </div>
      )}
    </div>
  );
}