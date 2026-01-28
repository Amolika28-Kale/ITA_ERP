import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRequirementById,
  updateRequirement
} from "../services/requirementService";
import { toast } from "react-hot-toast";
import CreateRequirement from "./CreateRequirement";

export default function EditRequirement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  useEffect(() => {
    getRequirementById(id)
      .then((res) => setForm(res.data))
      .catch(() => {
        toast.error("Edit not allowed");
        navigate("/my-requests");
      });
  }, [id]);

  const handleUpdate = async () => {
    await updateRequirement(id, form);
    toast.success("Requirement updated ✏️");
    navigate("/my-requests");
  };

  if (!form) return <div className="p-10 text-center">Loading...</div>;

  return (
    <CreateRequirement
      form={form}
      setForm={setForm}
      onSubmit={handleUpdate}
      isEdit
    />
  );
}
