const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
  try {
    res.json(await Settings.getSingle());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingle();
    const { deliveryFee, minOrder, isOpen } = req.body;

    if (deliveryFee !== undefined) {
      if (typeof deliveryFee !== "number" || deliveryFee < 0)
        return res.status(400).json({ message: "Invalid deliveryFee" });
      settings.deliveryFee = deliveryFee;
    }
    if (minOrder !== undefined) {
      if (typeof minOrder !== "number" || minOrder < 0)
        return res.status(400).json({ message: "Invalid minOrder" });
      settings.minOrder = minOrder;
    }
    if (isOpen !== undefined) {
      if (typeof isOpen !== "boolean")
        return res.status(400).json({ message: "isOpen must be true or false" });
      settings.isOpen = isOpen;
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};