const express = require("express");
const router = express.Router();

const {
  createRequirement,
  myRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  getAllRequirements,
  updateRequirementStatus
} = require("../controllers/requirementController");

const auth = require("../middleware/authMiddleware");

// Employee
router.post("/", auth, createRequirement);
router.get("/my", auth, myRequirements);
router.get("/:id", auth,getRequirementById); 
router.put("/:id", auth, updateRequirement);
router.delete("/:id", auth, deleteRequirement);

// Admin
router.get("/admin/all", auth,getAllRequirements);
router.patch("/admin/:id", auth, updateRequirementStatus);

module.exports = router;
