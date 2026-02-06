const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/paymentCollectionController");

router.use(auth);

/* ================= EMPLOYEE ================= */
router.post("/", auth, ctrl.createPayment);
router.get("/my", auth, ctrl.getMyPayments);
router.get("/:id", auth, ctrl.getPaymentById);
router.put("/:id", auth, ctrl.updateMyPayment);
// router.delete("/:id", auth, ctrl.deleteMyPayment);

/* ================= ADMIN ================= */
router.get("/", auth, ctrl.getAllPayments);
router.delete("/:id", auth, ctrl.deletePaymentByAdmin);
module.exports = router;
