// ✅ Use .js extension if you have "type": "module" in package.json
import Inquiry from "../models/Inquiry.js";
import PaymentCollection from "../models/PaymentCollection.js";
import Task from "../models/Task.js";

export const getThreeHourReport = async (req, res) => {
  try {
    const { employeeId, startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Time range is required" });
    }

    // 🕵️ Debugging: Check if model is actually a function
    if (typeof PaymentCollection.find !== 'function') {
      console.error("CRITICAL: PaymentCollection is loaded but .find() is missing. Current type:", typeof PaymentCollection);
      return res.status(500).json({ message: "Backend Model configuration error." });
    }

    const timeFilter = {
      createdAt: { $gte: new Date(startTime), $lte: new Date(endTime) }
    };

    let identityFilter = {};
    let taskIdentityFilter = {};

    if (employeeId && employeeId !== 'all') {
      identityFilter = { employee: employeeId };
      taskIdentityFilter = { assignedTo: { $in: [employeeId] } };
    }

    const [leads, payments, tasks] = await Promise.all([
      Inquiry.find({ ...timeFilter, ...identityFilter }).populate("employee", "name"),
      PaymentCollection.find({ ...timeFilter, ...identityFilter }).populate("employee", "name"),
      Task.find({ ...timeFilter, ...taskIdentityFilter }).populate("assignedTo", "name")
    ]);

    const summary = {
      leadsCount: leads.length,
      collectionTotal: payments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0),
      tasksCompleted: tasks.filter(t => t.status === 'completed').length
    };

    res.json({
      employee: employeeId === 'all' ? 'All Employees' : (leads[0]?.employee?.name || 'Selected Member'),
      summary,
      details: { leads, payments, tasks }
    });

  } catch (err) {
    console.error("REPORT_ERROR:", err);
    res.status(500).json({ message: "Server error during report generation", error: err.message });
  }
};