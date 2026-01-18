import { useEffect, useState } from "react";
import { sendMessage } from "../services/messageService";
import { fetchUsers } from "../services/userService";
import { Rocket, Search, Check, X } from "lucide-react";

export default function SendMessage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers().then((res) => setEmployees(res.data));
  }, []);

  const toggleUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleSend = async () => {
    if (!title || !body) return alert("Title & message required");
    if (!sendToAll && selectedUsers.length === 0) return alert("Select at least one employee");

    try {
      setLoading(true);
      await sendMessage({
        title,
        body,
        sendToAll,
        recipients: selectedUsers.map((u) => u._id),
      });
      alert("✅ Message sent");
      setTitle("");
      setBody("");
      setSelectedUsers([]);
      setSendToAll(true);
    } catch {
      alert("❌ Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket size={24} /> Broadcast Message
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-90">
            Communicate with your team instantly.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
              Subject
            </label>
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
              placeholder="e.g. Weekly Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Body Textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
              Message Content
            </label>
            <textarea
              rows="4"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800">Send to Everyone</p>
              <p className="text-xs text-slate-500">Notify all registered employees</p>
            </div>
            <button
              onClick={() => setSendToAll(!sendToAll)}
              className={`w-12 h-6 rounded-full transition-colors relative ${sendToAll ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sendToAll ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Select Users Section */}
          {!sendToAll && (
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Find specific team members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedUsers.find((u) => u._id === emp._id);
                  return (
                    <div
                      key={emp._id}
                      onClick={() => toggleUser(emp)}
                      className={`p-3 cursor-pointer flex items-center gap-3 transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{emp.email}</p>
                      </div>
                      {isSelected && <Check size={16} className="text-blue-600" />}
                    </div>
                  );
                })}
              </div>

              {/* Selection Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedUsers.map((u) => (
                  <span key={u._id} className="inline-flex items-center bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {u.name}
                    <button onClick={(e) => { e.stopPropagation(); toggleUser(u); }} className="ml-2 hover:text-blue-900 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSend}
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]
              ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : "Confirm & Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}