import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRequestById, updateRequest } from "../services/requestService";
import { toast } from "react-hot-toast";
import CreateRequest from "./createRequest";

export default function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    getRequestById(id)
      .then((res) => {
        const data = res.data;
        
        // IMPORTANT: Format dates to YYYY-MM-DD so HTML inputs can read them
        if (data.fromDate) data.fromDate = data.fromDate.split("T")[0];
        if (data.toDate) data.toDate = data.toDate.split("T")[0];
        
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <CreateRequest 
      form={form} 
      setForm={setForm} 
      onSubmit={handleUpdate} 
      isEdit={true} 
    />
  );
}