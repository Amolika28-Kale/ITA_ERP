const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/requestcontroller");

router.use(auth);

/* Employee */
router.post("/", ctrl.createRequest);
router.get("/my", ctrl.myRequests);
router.get("/:id", ctrl.getRequestById);
router.put("/:id", ctrl.updateRequest);
router.delete("/:id", ctrl.deleteRequest);

/* Admin */
router.get("/admin/all", ctrl.getAllRequests);
router.patch("/admin/:id", ctrl.updateRequestStatus);

module.exports = router;
