const cloudinary = require("../config/cloudinary");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `zinuks-cafe/${folder}`, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

exports.uploadMenuImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please attach an image (field name: image)" });
    }
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const result = await uploadBuffer(req.file.buffer, "menu");
    item.image = result.secure_url;
    await item.save();

    res.json({ message: "Image uploaded", image: item.image });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid id" });
    res.status(500).json({ message: err.message });
  }
};

exports.uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please attach an image (field name: image)" });
    }
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const result = await uploadBuffer(req.file.buffer, "categories");
    category.image = result.secure_url;
    await category.save();

    res.json({ message: "Image uploaded", image: category.image });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid id" });
    res.status(500).json({ message: err.message });
  }
};