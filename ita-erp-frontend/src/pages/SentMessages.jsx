import { useEffect, useState } from "react";
import { fetchSentMessages } from "../services/messageService";

export default function SentMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchSentMessages().then(res => setMessages(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📤 Sent Messages</h2>

      {messages.map(msg => (
        <div key={msg._id} className="border p-3 rounded mb-3">
          <h3 className="font-medium">{msg.title}</h3>
          <p className="text-sm text-gray-600">
            To: {msg.isBroadcast ? "All Employees" : msg.recipients.length}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(msg.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
