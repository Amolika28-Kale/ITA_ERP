const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/teamController");

// Debug middleware - log all requests to /api/teams
router.use(auth, (req, res, next) => {
  console.log(`🎯 Team route hit: ${req.method} ${req.originalUrl}`);
  console.log("Params:", req.params);
  console.log("Query:", req.query);
  console.log("User:", req.user?.id, req.user?.role);
  next();
});

// Basic CRUD
router.post("/", role("admin", "manager"), ctrl.createTeam);
router.get("/", ctrl.getTeams);
router.get("/:id", ctrl.getTeamById);
router.put("/:id", role("admin", "manager"), ctrl.updateTeam);
router.patch("/:id/disable", role("admin"), ctrl.disableTeam);

// Member management routes - ORDER IS IMPORTANT!
// These must come BEFORE any /:id routes that might conflict
router.get("/:id/available-employees", role("admin", "manager"), (req, res, next) => {
  console.log("📋 Available employees route matched!");
  console.log("Team ID:", req.params.id);
  next();
}, ctrl.getAvailableEmployees);

router.post("/:id/members", role("admin", "manager"), ctrl.addMember);
router.delete("/:id/members/:userId", role("admin", "manager"), ctrl.removeMember);

// Log all registered routes at startup
console.log("\n📌 Registered Team Routes:");
router.stack.forEach(layer => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
    console.log(`   ${methods} /api/teams${layer.route.path}`);
  }
});
console.log(""); // Empty line for spacing

module.exports = router;