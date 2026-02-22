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
    res.status(500).json({ message: "Submission failed", error: err.message });
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
    res.status(500).json({ message: "Error fetching reports" });
  }
};

// ✅ STAFF: विशिष्ट वेळेसाठी रिपोर्ट सबमिट केला आहे का तपासणे
export const checkSlotSubmission = async (req, res) => {
  try {
    const { startTime, endTime, date } = req.query;
    
    // Create date range for the specified date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Check if report exists for this user, time slot, and date
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
