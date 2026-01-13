import { useEffect, useState } from "react";
import { fetchInbox } from "../services/messageService";

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInbox()
      .then((res) => {
        setMessages(res.data);
        setFilteredMessages(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter Logic
  useEffect(() => {
    const results = messages.filter(msg =>
      msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(results);
  }, [searchTerm, messages]);

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h2>
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
              {filteredMessages.length}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search sender, title, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="p-4 sm:p-6 space-y-4">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer hover:shadow-md"
            >
              <div className="flex gap-4">
                {/* Avatar with Status Dot */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                    {msg.sender?.name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                      {msg.sender?.name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">12:45 PM</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate mb-1">
                    {msg.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                    {msg.body}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 italic">No messages found matching "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-2 text-sm text-blue-500 font-semibold"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}