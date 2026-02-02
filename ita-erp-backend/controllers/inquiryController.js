const Inquiry = require("../models/Inquiry");

// Create New Lead
// controllers/inquiryController.js

exports.createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.create({ 
      ...req.body, 
      employee: req.user.id, // लॉगिन असलेल्या युजरचा ID
      lastActionTime: new Date() // ऑटो टाइम स्टॅम्प
    });
    
    // एम्प्लॉयीचे नाव मिळवण्यासाठी पुन्हा फेच करू
    const populatedInquiry = await Inquiry.findById(inquiry._id).populate("employee", "name");
    
    res.status(201).json(populatedInquiry);
  } catch (err) {
    res.status(500).json({ message: "Lead capture failed" });
  }
};
// Get Inquiries with Search & Date Filters
exports.getInquiries = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { employee: req.user.id };
    const list = await Inquiry.find(filter)
      .populate("employee", "name email")
      .sort({ nextFollowUpDate: 1, createdAt: -1 }); // Priority to upcoming follow-ups
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { status, adminRemark, nextFollowUpDate } = req.body;
    const currentInquiry = await Inquiry.findById(req.params.id);

    if (!currentInquiry) return res.status(404).json({ message: "Lead not found" });

    // ✅ AUTO-UPDATE TIMING
    // Automatically capture the exact time the employee logged this activity
    const now = new Date();
    const timestampLabel = now.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });

    // Append new remark to history
    const updatedRemark = currentInquiry.adminRemark 
      ? `${currentInquiry.adminRemark}\n[${timestampLabel}]: ${adminRemark}`
      : `[${timestampLabel}]: ${adminRemark}`;

    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id, 
      { 
        status, 
        adminRemark: updatedRemark, 
        nextFollowUpDate,
        lastActionTime: now // ✅ Automatically updates with current time
      }, 
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};