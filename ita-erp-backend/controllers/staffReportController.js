import StaffReport from "../models/StaffReport.js";

// ✅ STAFF: मॅन्युअल रिपोर्ट सबमिट करणे
export const submitManualReport = async (req, res) => {
  try {
    const { reportText, intervalSlot } = req.body;
    
    const newReport = await StaffReport.create({
      employee: req.user.id,
      reportText,
      intervalSlot
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