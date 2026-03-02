// controllers/settingController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ================= GET LOGGED-IN USER ================= */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("teamId", "name");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/* ================= UPDATE FULL PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, phone, whatsappNumber, address, bio, dateOfBirth, 
      department, personalWishlist, expectationsFromITA, bankDetails 
    } = req.body;

    // Prepare update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (address !== undefined) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (department !== undefined) updateData.department = department;
    if (personalWishlist !== undefined) updateData.personalWishlist = personalWishlist;
    if (expectationsFromITA !== undefined) updateData.expectationsFromITA = expectationsFromITA;
    if (bankDetails) {
      updateData.bankDetails = {
        ...(bankDetails.accountHolderName && { accountHolderName: bankDetails.accountHolderName }),
        ...(bankDetails.bankName && { bankName: bankDetails.bankName }),
        ...(bankDetails.accountNumber && { accountNumber: bankDetails.accountNumber }),
        ...(bankDetails.ifscCode && { ifscCode: bankDetails.ifscCode }),
        ...(bankDetails.upiId && { upiId: bankDetails.upiId })
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

/* ================= CHANGE PASSWORD ================= */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
};

/* ================= ADMIN: GET ALL STAFF DETAILS ================= */
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["employee", "manager"] } })
      .select("-password -otp -resetOtp")
      .populate("teamId", "name");
    
    res.json(staff);
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: "Error fetching staff" });
  }
};

/* ================= ADMIN: GET STAFF BY ID ================= */
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findById(id)
      .select("-password -otp -resetOtp")
      .populate("teamId", "name");
    
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Error fetching staff" });
  }
};