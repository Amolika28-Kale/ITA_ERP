const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/userController");

router.use(auth, role("admin"));

router.post("/", ctrl.createUser);
router.get("/", ctrl.getUsers);
router.put("/:id", ctrl.updateUser);
router.patch("/:id/disable", ctrl.disableUser);

module.exports = router;
