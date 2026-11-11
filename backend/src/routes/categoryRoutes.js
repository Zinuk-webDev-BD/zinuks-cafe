const router = require("express").Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/menuController");
const { protect, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const { uploadCategoryImage } = require("../controllers/uploadController");
router.get("/", getCategories);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);
router.post(
  "/:id/image",
  protect,
  authorize("admin"),
  upload.single("image"),
  uploadCategoryImage
);
module.exports = router;