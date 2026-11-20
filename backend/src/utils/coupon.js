const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

const describe = (c) =>
  c.type === "percent"
    ? `${c.value}% off${c.maxDiscount > 0 ? ` (up to ${c.maxDiscount} Tk)` : ""}`
    : `${c.value} Tk off`;

const calcDiscount = (c, subtotal) => {
  let d =
    c.type === "percent" ? Math.floor((subtotal * c.value) / 100) : c.value;
  if (c.type === "percent" && c.maxDiscount > 0) d = Math.min(d, c.maxDiscount);
  // Discount can never be more than the subtotal
  return Math.max(0, Math.min(d, subtotal));
};

// Returns { error } or { coupon, discount, description }
async function evaluateCoupon(rawCode, subtotal, userId) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { error: "Enter a coupon code" };

  const coupon = await Coupon.findOne({ code });
  if (!coupon || !coupon.isActive) return { error: "Invalid coupon code" };

  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return { error: "This coupon has expired" };

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    return { error: "This coupon has reached its usage limit" };

  if (subtotal < coupon.minOrder)
    return { error: `Minimum order for this coupon is ${coupon.minOrder} Tk` };

  if (coupon.perUserLimit > 0) {
    const used = await Order.countDocuments({
      user: userId,
      couponCode: code,
      status: { $ne: "cancelled" },
    });
    if (used >= coupon.perUserLimit)
      return { error: "You have already used this coupon" };
  }

  return {
    coupon,
    discount: calcDiscount(coupon, subtotal),
    description: describe(coupon),
  };
}

// Atomically take one use of the coupon (safe when two people order at once)
async function reserveCoupon(coupon) {
  const updated = await Coupon.findOneAndUpdate(
    {
      _id: coupon._id,
      $or: [
        { usageLimit: 0 },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  return Boolean(updated);
}

// Give the use back (order cancelled or failed)
async function releaseCoupon(code) {
  if (!code) return;
  await Coupon.updateOne(
    { code, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  );
}

module.exports = { evaluateCoupon, reserveCoupon, releaseCoupon, describe };