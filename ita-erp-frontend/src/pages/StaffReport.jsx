import { useState, useEffect } from "react";
import { submitManualReport } from "../services/staffreportService";
import { FiClock, FiSend, FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function StaffReport() {
  const [rows, setRows] = useState([{ label: "", count: "" }]);
  const [loading, setLoading] = useState(false);
  const [hoursSinceLogin, setHoursSinceLogin] = useState(0);

  useEffect(() => {
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime) {
      const diff = Math.floor((new Date() - new Date(loginTime)) / (1000 * 60 * 60));
      setHoursSinceLogin(diff);
    }
  }, []);

  const getSlotLabel = () => {
    if (hoursSinceLogin < 3) return "0-3 Hours (Initial)";
    if (hoursSinceLogin < 6) return "3-6 Hours (Mid-Day)";
    if (hoursSinceLogin < 9) return "6-9 Hours (Evening)";
    return "Overtime Slot";
  };

  const addRow = () => {
    setRows([...rows, { label: "", count: "" }]);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedText = rows
      .map((row) => `${row.label || "N/A"}: ${row.count || 0}`)
      .join("\n");

    if (!formattedText.trim()) return toast.error("Report cannot be empty");

    setLoading(true);
    try {
      await submitManualReport({ reportText: formattedText, intervalSlot: getSlotLabel() });
      toast.success("Work report submitted successfully!");
      setRows([{ label: "", count: "" }]); 
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Submission failed";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // p-2 मोबाईलवर स्क्रीनच्या कडांना चिकटू नये म्हणून, md:p-6 मोठ्या स्क्रीनसाठी
    <div className="max-w-2xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      
      {/* Header Section - मोबाईलवर उंची कमी केली आहे */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 relative z-10">
          Current Session
        </p>
        <h2 className="text-xl md:text-3xl font-black italic mt-1 flex items-center gap-2 md:gap-3 relative z-10">
          <FiClock className="shrink-0 text-indigo-500" /> {getSlotLabel()}
        </h2>
      </div>

      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">
            Log Progress
          </h3>
          <button 
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl font-bold text-[10px] md:text-xs hover:bg-indigo-100 transition-all active:scale-95"
          >
            <FiPlus /> Add Task
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 md:space-y-3">
            {rows.map((row, index) => (
              <div 
                key={index} 
                // मोबाईलवर एकाखाली एक (flex-col) आणि डेस्कटॉपवर एका ओळीत (md:flex-row)
                className="flex flex-col md:flex-row gap-3 p-4 md:p-0 bg-slate-50 md:bg-transparent rounded-2xl relative border md:border-none border-slate-100 animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Task Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Total Calls"
                    className="w-full p-3 md:p-4 bg-white md:bg-slate-50 border-none rounded-xl md:rounded-2xl font-semibold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={row.label}
                    onChange={(e) => handleInputChange(index, "label", e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1 md:w-32 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Count</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full p-3 md:p-4 bg-white md:bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={row.count}
                      onChange={(e) => handleInputChange(index, "count", e.target.value)}
                      required
                    />
                  </div>
                  
                  {rows.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeRow(index)}
                      // मोबाईलवर हा आयकॉन अधिक ठळक केला आहे
                      className="p-3 md:p-4 text-red-400 hover:text-red-600 transition-colors bg-red-50 md:bg-transparent rounded-xl md:rounded-none"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            disabled={loading}
            className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Syncing..." : <><FiSend size={16} /> Submit {hoursSinceLogin < 9 ? '3-Hour' : ''} Report</>}
          </button>
        </form>
      </div>
      
      <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] pb-4">
        ITA-ERP Reporting System
      </p>
    </div>
  );
}