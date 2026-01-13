import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMessageById } from "../services/messageService";

export default function MessageDetails() {
  const { id } = useParams();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchMessageById(id).then(res => setMessage(res.data));
  }, [id]);

  if (!message) return null;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">{message.title}</h2>

      <p className="text-sm text-gray-500 mb-4">
        From: {message.sender?.name}
      </p>

      <div className="border rounded p-4 bg-gray-50">
        {message.body}
      </div>
    </div>
  );
}
