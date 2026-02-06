import { useEffect, useState, useMemo } from "react";
import { fetchInbox } from "../services/messageService";
import { Search, Inbox, XCircle } from "lucide-react"; // Using icons for a more professional feel

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

  const filteredMessages = useMemo(() => {
    return messages.filter(msg =>
      msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, messages]);

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white pb-20 md:pb-10">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl p-4 sm:p-6 border-b border-gray-100/50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Messages</h2>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-wider">
              {filteredMessages.length} Threads
            </div>
          </div>

          {/* Mobile-Optimized Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="p-4 sm:p-6 space-y-3">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
          ))
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Avatar with Responsive Size */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg">
                    {msg.sender?.name?.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-widest">
                      {msg.sender?.name}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium">12:45 PM</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">
                    {msg.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 leading-relaxed">
                    {msg.body}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
              <Inbox size={40} />
            </div>
            <h3 className="text-gray-900 font-bold">No conversations found</h3>
            <p className="text-gray-400 text-sm mt-1 px-10">We couldn't find any messages matching "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}