const router = require("express").Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  toggleAvailability,
  deleteItem,
} = require("../controllers/menuController");
const { protect, authorize } = require("../middlewares/auth");

router.get("/", getItems);
router.get("/:id", getItem);
router.post("/", protect, authorize("admin"), createItem);
router.put("/:id", protect, authorize("admin"), updateItem);
router.patch("/:id/availability", protect, authorize("admin"), toggleAvailability);
router.delete("/:id", protect, authorize("admin"), deleteItem);

module.exports = router;