const router = require("express").Router();
const { logout } = require("../controllers/attendenceController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

// 🚪 LOGOUT
router.post("/logout", logout);
module.exports = router;
