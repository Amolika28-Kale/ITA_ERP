import { useState, useEffect } from "react";
import { getIntervalReport } from "../services/reportService";
import { fetchUsers } from "../services/userService";
import { 
  FiClock, FiUser, FiZap, FiTarget, 
  FiDollarSign, FiCheckSquare, FiPieChart 
} from "react-icons/fi";
import toast from "react-hot-toast";

const TIME_SLOTS = [
  { label: "Morning (09:00 - 12:00)", start: 9, end: 12 },
  { label: "Afternoon (12:00 - 03:00)", start: 12, end: 15 },
  { label: "Evening (03:00 - 06:00)", start: 15, end: 18 },
  { label: "Late (06:00 - 09:00)", start: 18, end: 21 },
];

export default function AdminIntervalReports() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  const [filters, setFilters] = useState({
    employeeId: "all",
    slotLabel: ""
  });

  useEffect(() => {
    fetchUsers().then(res => setEmployees(res.data));
  }, []);

const generateReport = async () => {
    if (!filters.slotLabel) return toast.error("Please select a time window");

    const slot = TIME_SLOTS.find(s => s.label === filters.slotLabel);
    
    // Create dates for TODAY
    const start = new Date();
    start.setHours(slot.start, 0, 0, 0);

    const end = new Date();
    end.setHours(slot.end, 0, 0, 0);

    setLoading(true);
    try {
      const res = await getIntervalReport({
        employeeId: filters.employeeId,
        startTime: start.toISOString(), // Send clean ISO string
        endTime: end.toISOString()
      });
      setReportData(res.data);
    } catch (err) {
      toast.error("Failed to fetch interval data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8 animate-in fade-in">
      
      {/* --- SELECTOR PANEL --- */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-500/5">
        <h2 className="text-2xl font-black text-slate-900 mb-8 italic">
          Interval <span className="text-indigo-600">Productivity Auditor</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Team Member</label>
            <select 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.employeeId}
              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
            >
              <option value="all">Global (All Members)</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">3hr Time Slot</label>
            <select 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.slotLabel}
              onChange={(e) => setFilters({...filters, slotLabel: e.target.value})}
            >
              <option value="">Choose Interval...</option>
              {TIME_SLOTS.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
            </select>
          </div>

          <button 
            onClick={generateReport}
            disabled={loading}
            className="bg-slate-900 hover:bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Generate Audit"} <FiZap />
          </button>
        </div>
      </div>

      {/* --- REPORT VIEW --- */}
      {reportData && (
        <div className="space-y-8">
          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard label="Leads Contacted" value={reportData.summary.leadsCount} icon={<FiTarget/>} color="text-indigo-600" bg="bg-indigo-50" />
            <SummaryCard label="Collection Total" value={`₹${reportData.summary.collectionTotal}`} icon={<FiDollarSign/>} color="text-emerald-600" bg="bg-emerald-50" />
            <SummaryCard label="Tasks Completed" value={reportData.summary.tasksCompleted} icon={<FiCheckSquare/>} color="text-amber-600" bg="bg-amber-50" />
          </div>

          {/* Detailed Activity Logs */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b flex items-center gap-3">
                <FiPieChart className="text-indigo-600" />
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Window Activity Logs</h3>
             </div>
             
             <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {reportData.details.leads.map(lead => (
                  <ActivityRow key={lead._id} type="LEAD" title={lead.clientName} subtitle={lead.employee?.name} time={lead.createdAt} />
                ))}
                {reportData.details.payments.map(pay => (
                  <ActivityRow key={pay._id} type="PAYMENT" title={`₹${pay.paidAmount} - ${pay.clientName}`} subtitle={pay.employee?.name} time={pay.createdAt} />
                ))}
                {reportData.details.leads.length === 0 && reportData.details.payments.length === 0 && (
                   <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No activity recorded in this window.</div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components for cleaner code
function SummaryCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all">
      <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center text-2xl shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function ActivityRow({ type, title, subtitle, time }) {
  return (
    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
      <div>
        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 mr-2">{type}</span>
        <span className="font-bold text-slate-800 text-sm">{title}</span>
        <p className="text-[10px] text-slate-400 font-bold ml-11 uppercase">{subtitle}</p>
      </div>
      <span className="text-[10px] font-black text-slate-300">{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
}