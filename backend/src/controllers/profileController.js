const User = require("../models/User");

const pickAddress = (b) => ({
  label: String(b.label || "Home").trim().slice(0, 20),
  name: String(b.name || "").trim(),
  phone: String(b.phone || "").trim(),
  address: String(b.address || "").trim(),
});

const isValid = (a) => a.name && a.phone && a.address;

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) {
      if (!String(name).trim())
        return res.status(400).json({ message: "Name cannot be empty" });
      user.name = String(name).trim();
    }
    if (phone !== undefined) user.phone = String(phone).trim();

    await user.save();
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const data = pickAddress(req.body);
    if (!isValid(data))
      return res
        .status(400)
        .json({ message: "Name, phone and address are required" });

    const user = await User.findById(req.user._id);
    if (user.addresses.length >= 5)
      return res
        .status(400)
        .json({ message: "You can save up to 5 addresses" });

    const makeDefault =
      Boolean(req.body.isDefault) || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach((a) => (a.isDefault = false));

    user.addresses.push({ ...data, isDefault: makeDefault });
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    const data = pickAddress({ ...addr.toObject(), ...req.body });
    if (!isValid(data))
      return res
        .status(400)
        .json({ message: "Name, phone and address are required" });

    addr.set(data);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = String(a._id) === String(addr._id);
      });
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    const wasDefault = addr.isDefault;
    user.addresses.pull(addr._id);
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    if (String(newPassword).length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};