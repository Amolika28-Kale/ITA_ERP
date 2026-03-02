import { useState, useEffect } from "react";
import { submitManualReport, checkSlotSubmission, getMyReports } from "../services/staffreportService";
import { FiClock, FiSend, FiPlus, FiTrash2, FiCalendar, FiAlertCircle, FiList, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { format } from "date-fns";

// ✅ Hourly time slots from 9 AM to 6 PM
const TIME_SLOTS = [
  { id: 1, startTime: "09:00", endTime: "10:00", label: "Hour 1 (9:00 AM - 10:00 AM)", display: "09:00 – 10:00" },
  { id: 2, startTime: "10:00", endTime: "11:00", label: "Hour 2 (10:00 AM - 11:00 AM)", display: "10:00 – 11:00" },
  { id: 3, startTime: "11:00", endTime: "12:00", label: "Hour 3 (11:00 AM - 12:00 PM)", display: "11:00 – 12:00" },
  { id: 4, startTime: "12:00", endTime: "13:00", label: "Hour 4 (12:00 PM - 1:00 PM)", display: "12:00 – 13:00" },
  { id: 5, startTime: "13:00", endTime: "14:00", label: "Hour 5 (1:00 PM - 2:00 PM)", display: "13:00 – 14:00" },
  { id: 6, startTime: "14:00", endTime: "15:00", label: "Hour 6 (2:00 PM - 3:00 PM)", display: "14:00 – 15:00" },
  { id: 7, startTime: "15:00", endTime: "16:00", label: "Hour 7 (3:00 PM - 4:00 PM)", display: "15:00 – 16:00" },
  { id: 8, startTime: "16:00", endTime: "17:00", label: "Hour 8 (4:00 PM - 5:00 PM)", display: "16:00 – 17:00" },
  { id: 9, startTime: "17:00", endTime: "18:00", label: "Hour 9 (5:00 PM - 6:00 PM)", display: "17:00 – 18:00" },
];

export default function StaffReport() {
  const [rows, setRows] = useState([{ label: "", count: "" }]);
  const [loading, setLoading] = useState(false);
  const [checkingSlot, setCheckingSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submittedSlots, setSubmittedSlots] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("week"); // 'week', 'month', 'all'

  // Fetch report history
  useEffect(() => {
    fetchReportHistory();
  }, [historyFilter]);

// Update the fetchReportHistory function
const fetchReportHistory = async () => {
  setLoadingHistory(true);
  try {
    console.log("Fetching reports with filter:", historyFilter);
    const res = await getMyReports(historyFilter);
    console.log("Report history response:", res.data);
    setReportHistory(res.data);
  } catch (err) {
    console.error("Error fetching report history:", err);
    toast.error("Failed to load report history. Please try again.");
    setReportHistory([]); // Set empty array on error
  } finally {
    setLoadingHistory(false);
  }
};

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

  // Check submission status for all slots today
  useEffect(() => {
    const checkAllSlots = async () => {
      const today = new Date().toISOString().split('T')[0];
      const submitted = [];
      
      for (const slot of TIME_SLOTS) {
        try {
          const response = await checkSlotSubmission(slot.startTime, slot.endTime, today);
          const result = response.data || response;
          if (result.submitted) {
            submitted.push(slot.id);
          }
        } catch (err) {
          console.error(`Error checking slot ${slot.id}:`, err);
        }
      }
      setSubmittedSlots(submitted);
    };
    
    checkAllSlots();
  }, []);

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
        
        const result = response.data || response;
        setAlreadySubmitted(result.submitted);
        
        if (result.submitted) {
          toast.error(`You have already submitted report for ${selectedSlot.label} today`, {
            icon: '⚠️',
            duration: 4000
          });
        }
      } catch (err) {
        console.error("Error checking submission:", err);
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
      setSubmittedSlots([...submittedSlots, selectedSlot.id]);
      fetchReportHistory(); // Refresh history after submission
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Submission failed";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentSlot = getCurrentSlot();

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      
      {/* Header Section with Time Slot Selection */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />
        
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 relative z-10">
              Hourly Report Submission
            </p>
            <h2 className="text-xl md:text-2xl font-bold mt-1">9:00 AM - 6:00 PM</h2>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 bg-indigo-600/30 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all"
          >
            <FiList size={14} />
            {showHistory ? "Hide History" : "View History"}
          </button>
        </div>
        
        <div className="mt-4 relative z-10">
          <select
            value={selectedSlot.id}
            onChange={(e) => {
              const slot = TIME_SLOTS.find(s => s.id === parseInt(e.target.value));
              setSelectedSlot(slot);
            }}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {TIME_SLOTS.map(slot => {
              const isSubmitted = submittedSlots.includes(slot.id);
              return (
                <option 
                  key={slot.id} 
                  value={slot.id}
                  disabled={isSubmitted}
                  className={isSubmitted ? 'text-slate-500' : ''}
                >
                  {slot.label} {isSubmitted ? '✓ Submitted' : ''}
                </option>
              );
            })}
          </select>
          
          {currentSlot && (
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300">
              <FiCalendar />
              <span>Current active slot: {currentSlot.label}</span>
            </div>
          )}

          {/* Slot Status Summary */}
          <div className="mt-4 grid grid-cols-9 gap-1">
            {TIME_SLOTS.map(slot => (
              <div key={slot.id} className="text-center">
                <div className={`text-[6px] font-bold uppercase ${submittedSlots.includes(slot.id) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {slot.display.split('–')[0]}
                </div>
                <div className={`mt-1 h-1 rounded-full ${submittedSlots.includes(slot.id) ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              </div>
            ))}
          </div>
        </div>

        {checkingSlot && (
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <FiClock className="animate-spin" size={12} />
            Checking submission status...
          </div>
        )}
        
        {alreadySubmitted && (
          <div className="mt-2 text-xs text-red-400 font-semibold flex items-center gap-1">
            <FiAlertCircle size={12} />
            ⚠️ You have already submitted for this slot today
          </div>
        )}
      </div>

      {/* Report History Section */}
      {showHistory && (
        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">
              Your Report History
            </h3>
            <div className="flex gap-2">
              {["week", "month", "all"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    historyFilter === filter
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter === "week" ? "This Week" : filter === "month" ? "This Month" : "All Time"}
                </button>
              ))}
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <FiClock className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : reportHistory.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reportHistory.map((report) => {
                const slot = TIME_SLOTS.find(s => s.startTime === report.timeSlot?.startTime);
                return (
                  <div
                    key={report._id}
                    className="group bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-full ${
                            slot ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {slot ? slot.display : report.timeSlot?.label || 'N/A'}
                          </span>
                          <span className="text-[8px] text-slate-400">
                            {format(new Date(report.submittedAt), "dd MMM yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {report.reportText}
                        </p>
                      </div>
                      <div className="text-right text-[10px] text-slate-400">
                        {format(new Date(report.submittedAt), "hh:mm a")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl">
              <p className="text-slate-400 text-sm">No reports found for this period</p>
            </div>
          )}
        </div>
      )}

      {/* Report Submission Form */}
      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">
              Submit Hourly Report
            </h3>
            <p className="text-[8px] text-indigo-600 font-bold uppercase mt-1">
              {selectedSlot.label}
            </p>
          </div>
          <button 
            type="button"
            onClick={addRow}
            disabled={alreadySubmitted}
            className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl font-bold text-[10px] md:text-xs hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={14} />
            Add Task
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
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
                    Task Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Total Calls, Meetings, Reports"
                    className="w-full p-3 md:p-4 bg-white md:bg-slate-50 border-none rounded-xl md:rounded-2xl font-semibold text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    value={row.label}
                    onChange={(e) => handleInputChange(index, "label", e.target.value)}
                    disabled={alreadySubmitted}
                    required={index === 0}
                  />
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1 md:w-32 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
                      Count
                    </label>
                    <input
                      type="number"
                      min="0"
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

          <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Tasks: {rows.length}</span>
            <span>Completed Tasks: {rows.filter(r => r.label.trim()).length}</span>
          </div>

          <button
            type="submit"
            disabled={loading || alreadySubmitted || checkingSlot}
            className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <FiClock className="animate-spin" size={16} />
                Submitting...
              </>
            ) : alreadySubmitted ? (
              <>
                <FiAlertCircle size={16} />
                Already Submitted
              </>
            ) : (
              <>
                <FiSend size={16} />
                Submit Report for {selectedSlot.display}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Daily Progress Summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-100">
        <h4 className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Today's Submission Progress
        </h4>
        <div className="grid grid-cols-9 gap-1">
          {TIME_SLOTS.map(slot => {
            const isSubmitted = submittedSlots.includes(slot.id);
            return (
              <div key={slot.id} className="text-center">
                <div className={`text-[7px] font-bold ${isSubmitted ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {slot.display.split('–')[0]}
                </div>
                <div className={`mt-1 h-1 rounded-full ${isSubmitted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              </div>
            );
          })}
        </div>
        <p className="text-[7px] text-center text-slate-400 mt-2">
          {submittedSlots.length} of {TIME_SLOTS.length} hourly reports submitted today
        </p>
      </div>
      
      <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] pb-4">
        ITA-ERP • Hourly Reporting System
      </p>
    </div>
  );
}