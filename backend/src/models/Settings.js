const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    deliveryFee: { type: Number, default: 60, min: 0 },
    minOrder: { type: Number, default: 150, min: 0 },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// সবসময় একটাই settings ডকুমেন্ট থাকবে
settingsSchema.statics.getSingle = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);