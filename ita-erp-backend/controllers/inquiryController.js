const Inquiry = require("../models/Inquiry");

// Create New Lead
exports.createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.create({ ...req.body, employee: req.user.id });
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: "Inquiry save failed" });
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

// ✅ Updated: Advanced Update with Remark History
exports.updateInquiry = async (req, res) => {
  try {
    const { status, adminRemark, nextFollowUpDate } = req.body;
    const currentInquiry = await Inquiry.findById(req.params.id);

    // Keep history of remarks with timestamps
    const timestamp = new Date().toLocaleString();
    const updatedRemark = currentInquiry.adminRemark 
      ? `${currentInquiry.adminRemark}\n[${timestamp}]: ${adminRemark}`
      : `[${timestamp}]: ${adminRemark}`;

    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id, 
      { status, adminRemark: updatedRemark, nextFollowUpDate }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};