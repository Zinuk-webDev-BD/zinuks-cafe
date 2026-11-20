const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 1 },
    // Only for percent coupons. 0 means no cap
    maxDiscount: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    // 0 means unlimited
    usageLimit: { type: Number, default: 0 },
    // How many times one customer can use it. 0 means unlimited
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);