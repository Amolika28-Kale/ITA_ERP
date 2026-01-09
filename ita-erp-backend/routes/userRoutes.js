const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/userController");

router.use(auth, role("admin", "manager"));

router.post("/", ctrl.createUser);
router.get("/", ctrl.getUsers);
router.put("/:id", ctrl.updateUser);
router.patch("/:id/status", ctrl.toggleUserStatus);
router.patch("/:id/team", ctrl.assignUserToTeam);


module.exports = router;
