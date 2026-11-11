const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");

const handleError = (res, err) => {
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid id" });
  if (err.code === 11000)
    return res.status(409).json({ message: "Already exists" });
  if (err.name === "ValidationError")
    return res.status(400).json({ message: err.message });
  res.status(500).json({ message: err.message });
};

/* ---------- Categories ---------- */

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("order");
    res.json(categories);
  } catch (err) {
    handleError(res, err);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const used = await MenuItem.exists({ category: req.params.id });
    if (used) {
      return res
        .status(400)
        .json({ message: "Category has menu items, delete or move them first" });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    handleError(res, err);
  }
};

/* ---------- Menu items ---------- */

exports.getItems = async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: "i" };
    const items = await MenuItem.find(filter)
      .populate("category", "name")
      .sort("name");
    res.json(items);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate("category", "name");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    handleError(res, err);
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    handleError(res, err);
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ _id: item._id, name: item.name, isAvailable: item.isAvailable });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    handleError(res, err);
  }
};