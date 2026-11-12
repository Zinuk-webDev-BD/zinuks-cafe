const router = require("express").Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  cancelMyOrder,
  getAllOrders,
  updateStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middlewares/auth");

router.use(protect);

// Customer
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.patch("/:id/cancel", cancelMyOrder);

// Admin
router.get("/", authorize("admin"), getAllOrders);
router.patch("/:id/status", authorize("admin"), updateStatus);

// সবার শেষে (নইলে /my কে id ধরে নেবে)
router.get("/:id", getOrder);

module.exports = router;