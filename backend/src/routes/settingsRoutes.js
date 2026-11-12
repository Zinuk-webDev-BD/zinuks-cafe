const router = require("express").Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const { protect, authorize } = require("../middlewares/auth");

router.get("/", getSettings);
router.put("/", protect, authorize("admin"), updateSettings);

module.exports = router;