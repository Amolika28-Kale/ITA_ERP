const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const { getTodayIST } = require("../utils/getToday");
const { sendMail } = require("../utils/mail");

// /* ================= LOGIN ================= */
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ message: "Email & password required" });

//     const user = await User.findOne({
//       email,
//       isActive: true,
//       isVerified: true
//     });

//     if (!user)
//       return res.status(401).json({ message: "Invalid credentials or not verified" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid credentials" });

//     // Attendance
//     const today = getTodayIST();
//     const existing = await Attendance.findOne({
//       user: user._id,
//       date: today,
//       logoutTime: null
//     });

//     if (!existing) {
//       await Attendance.create({
//         user: user._id,
//         date: today,
//         loginTime: new Date()
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role, name: user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         role: user.role
//       }
//     });

//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ message: "Login failed" });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified || !user.isActive)
      return res.status(401).json({ message: "Account not verified" });

// 🚫 BLOCK GOOGLE USERS HERE
if (user.provider === "google") {
  return res.status(400).json({
    message: "Use Google login to continue"
  });
}


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Attendance on login
const today = getTodayIST();

// Check if already logged in today
const existingAttendance = await Attendance.findOne({
  user: user._id,
  date: today,
  logoutTime: null
});

if (!existingAttendance) {
  await Attendance.create({
    user: user._id,
    date: today,
    loginTime: new Date(),
    status: "present"
  });
}



    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};


/* ================= SIGNUP ================= */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  otp,
  otpExpiry: Date.now() + 10 * 60 * 1000,
  isActive: false,
  isVerified: false,
  role: "employee",
  provider: "local"
});


try {
  await sendMail({
    to: email,
    subject: "Verify your Task ERP account",
    html: `<h2>Your OTP</h2><h1>${otp}</h1>`
  });
} catch (mailErr) {
  console.error("MAIL ERROR:", mailErr.message);

  // ✅ allow signup to continue
}

res.json({
  message: "Account created. Please verify OTP.",
});


  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Signup failed" });
  }
};


/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Activate account
    user.isVerified = true;
    user.isActive = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // 🔐 Generate JWT (AUTO LOGIN)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Account verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};



/* ================= RESEND OTP ================= */
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, isVerified: false });
  if (!user)
    return res.status(400).json({ message: "User already verified or not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();
try{
  await sendMail({
    to: email,
    subject: "Resend OTP - Task ERP",
    html: `<h2>Your OTP</h2><h1>${otp}</h1>`
  });
}catch (err) {
  console.error("MAIL ERROR:", err.message);
}
  res.json({ message: "OTP resent successfully" });
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetOtp = otp;
  user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();
try{
  await sendMail({
    to: email,
    subject: "Reset Password OTP",
    html: `<h2>Password Reset OTP</h2><h1>${otp}</h1>`
  });
}catch (err) {
  console.error("MAIL ERROR:", err.message);
}
  res.json({ message: "Reset OTP sent" });
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (user.resetOtp !== otp || user.resetOtpExpiry < Date.now())
    return res.status(400).json({ message: "Invalid or expired OTP" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};
