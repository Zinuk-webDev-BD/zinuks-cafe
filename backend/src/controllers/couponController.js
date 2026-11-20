const Coupon = require("../models/Coupon");
const { evaluateCoupon, describe } = require("../utils/coupon");

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

/* ---------- Customer ---------- */

// Preview only. The real discount is calculated again when the order is placed
exports.validateCoupon = async (req, res) => {
  try {
    const subtotal = num(req.body.subtotal);
    const result = await evaluateCoupon(req.body.code, subtotal, req.user._id);
    if (result.error) return res.status(400).json({ message: result.error });

    res.json({
      code: result.coupon.code,
      discount: result.discount,
      description: result.description,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- Admin ---------- */

exports.listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");
    res.json(coupons.map((c) => ({ ...c.toObject(), description: describe(c) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,20}$/.test(code))
      return res.status(400).json({
        message: "Code must be 3-20 characters: letters, numbers, - or _",
      });

    const type = req.body.type;
    if (!["percent", "fixed"].includes(type))
      return res.status(400).json({ message: "Choose a discount type" });

    const value = num(req.body.value);
    if (value < 1)
      return res.status(400).json({ message: "Discount value must be at least 1" });
    if (type === "percent" && value > 100)
      return res.status(400).json({ message: "Percent cannot be more than 100" });

    let expiresAt = null;
    if (req.body.expiresAt) {
      expiresAt = new Date(`${req.body.expiresAt}T23:59:59`);
      if (Number.isNaN(expiresAt.getTime()))
        return res.status(400).json({ message: "Invalid expiry date" });
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      maxDiscount: type === "percent" ? num(req.body.maxDiscount) : 0,
      minOrder: num(req.body.minOrder),
      expiresAt,
      usageLimit: num(req.body.usageLimit),
      perUserLimit: num(req.body.perUserLimit, 1),
    });

    res.status(201).json({ ...coupon.toObject(), description: describe(coupon) });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "This code already exists" });
    res.status(500).json({ message: err.message });
  }
};

// Only turn on/off
exports.toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ ...coupon.toObject(), description: describe(coupon) });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid id" });
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid id" });
    res.status(500).json({ message: err.message });
  }
};