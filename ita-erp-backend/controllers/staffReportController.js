import StaffReport from "../models/StaffReport.js";

// ✅ STAFF: मॅन्युअल रिपोर्ट सबमिट करणे
export const submitManualReport = async (req, res) => {
  try {
    const { reportText, timeSlot } = req.body;
    
    const newReport = await StaffReport.create({
      employee: req.user.id,
      reportText,
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        label: timeSlot.label
      }
    });

    res.status(201).json({ message: "Report submitted successfully", newReport });
  } catch (err) {
    console.error("Submit report error:", err);
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
};

// ✅ STAFF: Get my reports with filters (ADD THIS FUNCTION)
export const getMyReports = async (req, res) => {
  console.log("📋 getMyReports called for user:", req.user.id);
  console.log("Query params:", req.query);
  
  try {
    const { filter } = req.query;
    const now = new Date();
    let startDate = new Date();
    
    // Set date range based on filter
    if (filter === "week") {
      startDate.setDate(now.getDate() - 7);
      console.log("Filtering for last 7 days from:", startDate);
    } else if (filter === "month") {
      startDate.setMonth(now.getMonth() - 1);
      console.log("Filtering for last month from:", startDate);
    } else {
      startDate = new Date(0); // Beginning of time for "all"
      console.log("Filtering for all time");
    }

    // Find reports for the logged-in user
    const reports = await StaffReport.find({
      employee: req.user.id,
      createdAt: { $gte: startDate }
    })
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${reports.length} reports for user ${req.user.id}`);
    res.json(reports);
  } catch (err) {
    console.error("❌ Error fetching my reports:", err);
    res.status(500).json({ message: "Error fetching reports", error: err.message });
  }
};

// ✅ ADMIN: सर्व स्टाफचे रिपोर्ट पाहणे
export const getAllStaffReports = async (req, res) => {
  try {
    const reports = await StaffReport.find()
      .populate("employee", "name email role")
      .sort({ createdAt: -1 });
      
    res.json(reports);
  } catch (err) {
    console.error("Error fetching all reports:", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

// ✅ ADMIN: तारखेनुसार रिपोर्ट फिल्टर करणे
export const getReportsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const reports = await StaffReport.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate("employee", "name email role")
      .sort({ "timeSlot.startTime": 1 });
      
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports by date:", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

// ✅ STAFF: विशिष्ट वेळेसाठी रिपोर्ट सबमिट केला आहे का तपासणे
export const checkSlotSubmission = async (req, res) => {
  try {
    const { startTime, endTime, date } = req.query;
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const existingReport = await StaffReport.findOne({
      employee: req.user.id,
      "timeSlot.startTime": startTime,
      "timeSlot.endTime": endTime,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    res.json({ 
      submitted: !!existingReport,
      report: existingReport || null 
    });
  } catch (err) {
    console.error("Error checking slot submission:", err);
    res.status(500).json({ message: "Error checking submission status", error: err.message });
  }
};