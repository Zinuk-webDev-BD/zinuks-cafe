const router = require("express").Router();
const {
  validateCoupon,
  listCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, authorize } = require("../middlewares/auth");

router.use(protect);

// Customer
router.post("/validate", validateCoupon);

// Admin
router.get("/", authorize("admin"), listCoupons);
router.post("/", authorize("admin"), createCoupon);
router.patch("/:id/toggle", authorize("admin"), toggleCoupon);
router.delete("/:id", authorize("admin"), deleteCoupon);

module.exports = router;