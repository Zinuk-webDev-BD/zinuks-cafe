const router = require("express").Router();
const { register, login, me } = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

// টেস্টের জন্য: শুধু অ্যাডমিন ঢুকতে পারবে
router.get("/admin-test", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome admin" });
});

module.exports = router;