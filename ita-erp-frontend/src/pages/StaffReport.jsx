import { useState, useEffect } from "react";
import { submitManualReport, checkSlotSubmission } from "../services/staffreportService";
import { FiClock, FiSend, FiPlus, FiTrash2, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";

// Predefined time slots
const TIME_SLOTS = [
  { id: 1, startTime: "10:00", endTime: "12:00", label: "Morning Slot (10AM - 12PM)" },
  { id: 2, startTime: "12:00", endTime: "15:00", label: "Afternoon Slot (12PM - 3PM)" },
  { id: 3, startTime: "17:00", endTime: "18:00", label: "Evening Slot (5PM - 6PM)" },
];

export default function StaffReport() {
  const [rows, setRows] = useState([{ label: "", count: "" }]);
  const [loading, setLoading] = useState(false);
  const [checkingSlot, setCheckingSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if current time falls within any slot
  const getCurrentSlot = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    for (const slot of TIME_SLOTS) {
      if (currentTimeStr >= slot.startTime && currentTimeStr < slot.endTime) {
        return slot;
      }
    }
    return null;
  };

  // Auto-select slot based on current time
  useEffect(() => {
    const currentSlot = getCurrentSlot();
    if (currentSlot) {
      setSelectedSlot(currentSlot);
    }
  }, [currentTime]);

// Check if already submitted for selected slot today
useEffect(() => {
  const checkSubmission = async () => {
    if (!selectedSlot) return;
    
    setCheckingSlot(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await checkSlotSubmission(
        selectedSlot.startTime, 
        selectedSlot.endTime, 
        today
      );
      
      // Handle the response properly - check if response has data property
      const result = response.data || response;
      setAlreadySubmitted(result.submitted);
      
      if (result.submitted) {
        toast.error(`You have already submitted report for ${selectedSlot.label} today`);
      }
    } catch (err) {
      console.error("Error checking submission:", err);
      // Don't show error to user, just log it
      // Optionally show a toast for network errors
      if (!err.response) {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setCheckingSlot(false);
    }
  };

  checkSubmission();
}, [selectedSlot]);

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
    
    if (alreadySubmitted) {
      return toast.error("You cannot submit multiple reports for the same time slot");
    }

    const formattedText = rows
      .map((row) => `${row.label || "N/A"}${row.count ? `: ${row.count}` : ""}`)
      .join("\n");

    if (!formattedText.trim()) return toast.error("Report cannot be empty");

    setLoading(true);
    try {
      await submitManualReport({ 
        reportText: formattedText, 
        timeSlot: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          label: selectedSlot.label
        }
      });
      toast.success(`Report submitted successfully for ${selectedSlot.label}!`);
      setRows([{ label: "", count: "" }]);
      setAlreadySubmitted(true);
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Submission failed";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentSlot = getCurrentSlot();

  return (
    <div className="max-w-2xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      
      {/* Header Section with Time Slot Selection */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />
        
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 relative z-10">
          Select Time Slot
        </p>
        
        <div className="mt-3 relative z-10">
          <select
            value={selectedSlot.id}
            onChange={(e) => {
              const slot = TIME_SLOTS.find(s => s.id === parseInt(e.target.value));
              setSelectedSlot(slot);
            }}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {TIME_SLOTS.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
          
          {currentSlot && (
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300">
              <FiCalendar />
              <span>Current active slot: {currentSlot.label}</span>
            </div>
          )}
        </div>

        {checkingSlot && (
          <div className="mt-2 text-xs text-slate-400">Checking submission status...</div>
        )}
        
        {alreadySubmitted && (
          <div className="mt-2 text-xs text-red-400 font-semibold">
            ⚠️ You have already submitted for this slot today
          </div>
        )}
      </div>

      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">
            Log Progress - {selectedSlot.label}
          </h3>
          <button 
            type="button"
            onClick={addRow}
            disabled={alreadySubmitted}
            className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl font-bold text-[10px] md:text-xs hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 md:space-y-3">
            {rows.map((row, index) => (
              <div 
                key={index} 
                className="flex flex-col md:flex-row gap-3 p-4 md:p-0 bg-slate-50 md:bg-transparent rounded-2xl relative border md:border-none border-slate-100 animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Task Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Total Calls"
                    className="w-full p-3 md:p-4 bg-white md:bg-slate-50 border-none rounded-xl md:rounded-2xl font-semibold text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    value={row.label}
                    onChange={(e) => handleInputChange(index, "label", e.target.value)}
                    disabled={alreadySubmitted}
                    required
                  />
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1 md:w-32 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Count</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full p-3 md:p-4 bg-white md:bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      value={row.count}
                      onChange={(e) => handleInputChange(index, "count", e.target.value)}
                      disabled={alreadySubmitted}
                    />
                  </div>
                  
                  {rows.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={alreadySubmitted}
                      className="p-3 md:p-4 text-red-400 hover:text-red-600 transition-colors bg-red-50 md:bg-transparent rounded-xl md:rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || alreadySubmitted || checkingSlot}
            className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Submitting..." : 
             alreadySubmitted ? "Already Submitted" : 
             <><FiSend size={16} /> Submit Report for {selectedSlot.label}</>}
          </button>
        </form>
      </div>
      
      <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] pb-4">
        ITA-ERP Reporting System
      </p>
    </div>
  );
}