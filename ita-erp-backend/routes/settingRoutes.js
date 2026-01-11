const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/settingController");

router.use(auth);

router.get("/me", ctrl.getMyProfile);
router.put("/me", ctrl.updateProfile);
router.put("/change-password", ctrl.changePassword);

module.exports = router;
