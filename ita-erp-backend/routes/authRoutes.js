const router = require("express").Router();
const ctrl = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const { markLoginAttendance } = require("../utils/attendance");
router.post("/login", ctrl.login);
router.post("/signup", ctrl.signup);
router.post("/verify-otp", ctrl.verifyOtp);
router.post("/resend-otp", ctrl.resendOtp);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);

// routes/authRoutes.js मध्ये बदल
router.get("/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/calendar.events.readonly"], // ✅ कॅलेंडर स्कोप ॲड केली
    prompt: "select_account",
    accessType: "offline" // ✅ रिफ्रेश टोकन मिळवण्यासाठी आवश्यक
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {

    // 🔥 CREATE ATTENDANCE HERE
    await markLoginAttendance(req.user._id);

    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
    );
  }
);

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
});
// routes/authRoutes.js
router.get("/google/calendar", authMiddleware, ctrl.getGoogleEvents);

module.exports = router;
