const router = require("express").Router();
const  auth  = require("../middleware/authMiddleware");
const ctrl = require("../controllers/leaveController");

router.use(auth);

/* Employee */
router.post("/", auth, ctrl.applyLeave);
router.get("/my", auth, ctrl.myLeaves);

/* Admin */
router.get("/", auth, ctrl.getAllLeaves);
router.patch("/:id", auth, ctrl.updateLeaveStatus);
module.exports = router;
