import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRequestById, updateRequest } from "../services/requestService";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react"; // Added for mobile UX
import CreateRequest from "./createRequest";

export default function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    getRequestById(id)
      .then((res) => {
        const data = res.data;
        
        // Ensure dates are string-formatted for HTML5 date inputs
        if (data.fromDate) data.fromDate = new Date(data.fromDate).toISOString().split("T")[0];
        if (data.toDate) data.toDate = new Date(data.toDate).toISOString().split("T")[0];
        
        setForm(data);
      })
      .catch((err) => {
        toast.error("You cannot edit this request or it doesn't exist");
        navigate("/my-requests");
      });
  }, [id, navigate]);

  const handleUpdate = async () => {
    try {
      await updateRequest(id, form);
      toast.success("Updated successfully ✏️");
      navigate("/my-requests");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (!form) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] p-4 space-y-4">
        {/* Mobile-friendly spinner */}
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Syncing Request Data...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CreateRequest 
        form={form} 
        setForm={setForm} 
        onSubmit={handleUpdate} 
        isEdit={true} 
      />
    </div>
  );
}