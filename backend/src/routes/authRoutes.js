const router = require("express").Router();
const { register, login, me } = require("../controllers/authController");
const {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
} = require("../controllers/profileController");
const { protect, authorize } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

// টেস্টের জন্য: শুধু অ্যাডমিন ঢুকতে পারবে
router.get("/admin-test", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome admin" });
});

module.exports = router;