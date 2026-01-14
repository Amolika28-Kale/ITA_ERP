import { useEffect, useState, useMemo } from "react";
import { fetchInbox } from "../services/messageService";

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInbox()
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Optimized Filter Logic using useMemo
  const filteredMessages = useMemo(() => {
    return messages.filter(msg =>
      msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, messages]);

  return (
    // Clean, light-focused background
    <div className="max-w-2xl mx-auto min-h-screen bg-white">
      
      {/* Sticky Header: Uses a soft grey border and high-clarity text */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
              {filteredMessages.length} Messages
            </div>
          </div>

          {/* Search Input: Refined for light mode visibility */}
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search sender, title, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="p-4 sm:p-6 space-y-3">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
          ))
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {msg.sender?.name?.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                      {msg.sender?.name}
                    </p>
                    <span className="text-[10px] text-gray-400">12:45 PM</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {msg.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {msg.body}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">No results for "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-2 text-sm text-blue-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}