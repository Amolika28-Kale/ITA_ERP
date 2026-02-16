const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const { getTodayIST } = require("../utils/getToday");
const { sendMail } = require("../utils/mail");
const { markLoginAttendance } = require("../utils/attendance");
const { google } = require('googleapis');
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
await markLoginAttendance(user._id);
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

exports.getGoogleEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.googleAccessToken) {
      return res.status(400).json({ message: "Google account not linked" });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ 
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken 
    });

    // ✅ टोकन आपोआप रिफ्रेश झाल्यावर डेटाबेसमध्ये सेव्ह करण्यासाठी
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        user.googleAccessToken = tokens.access_token;
        if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
        await user.save();
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 15,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(response.data.items);
  } catch (err) {
    // जर ४०१ एरर आली, तर याचा अर्थ टोकन पूर्णपणे निकामी झाले आहे
    if (err.code === 401) {
       console.error("Token invalid, user needs to re-login");
    }
    console.error("Calendar Fetch Error:", err.message);
    res.status(err.code || 500).json({ message: "Failed to fetch calendar" });
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
    subject: "Verify your ITA-ERP account",
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
    subject: "Resend OTP - ITA-ERP",
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
