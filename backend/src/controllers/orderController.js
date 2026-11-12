const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Settings = require("../models/Settings");
const { notifyAdmins, notifyUser } = require("../sockets");

const FLOW = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

const makeOrderNumber = () =>
  "ZC-" +
  Date.now().toString(36).toUpperCase() +
  Math.floor(Math.random() * 90 + 10);

const handleError = (res, err) => {
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid id" });
  res.status(500).json({ message: err.message });
};

/* ---------- Customer ---------- */

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod = "cod" } = req.body;
    const fail = (message) => res.status(400).json({ message });

    if (!Array.isArray(items) || items.length === 0)
      return fail("Cart is empty");
    if (!address || !address.name || !address.phone || !address.address)
      return fail("Delivery name, phone and address are required");
    if (paymentMethod !== "cod")
      return fail("Only cash on delivery is available right now");

    const settings = await Settings.getSingle();
    if (!settings.isOpen)
      return fail("Sorry, the cafe is closed right now");

    const dbItems = await MenuItem.find({
      _id: { $in: items.map((i) => i.menuItem) },
    });
    const itemMap = new Map(dbItems.map((d) => [String(d._id), d]));

    const orderItems = [];
    let subtotal = 0;

    for (const line of items) {
      const dbItem = itemMap.get(String(line.menuItem));
      if (!dbItem) return fail("An item in your cart was not found");
      if (!dbItem.isAvailable)
        return fail(`${dbItem.name} is not available right now`);

      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
        return fail("Quantity must be between 1 and 20");

      let unitPrice = dbItem.price;
      let variantName = "";
      if (line.variant) {
        const variant = dbItem.variants.find((v) => v.name === line.variant);
        if (!variant)
          return fail(`Invalid size "${line.variant}" for ${dbItem.name}`);
        unitPrice = variant.price;
        variantName = variant.name;
      }

      const addOns = [];
      for (const addOnName of line.addOns || []) {
        const addOn = dbItem.addOns.find((a) => a.name === addOnName);
        if (!addOn)
          return fail(`Invalid add-on "${addOnName}" for ${dbItem.name}`);
        addOns.push({ name: addOn.name, price: addOn.price });
        unitPrice += addOn.price;
      }

      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      orderItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        variant: variantName,
        addOns,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    if (subtotal < settings.minOrder)
      return fail(`Minimum order is ${settings.minOrder} Tk`);

    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      user: req.user._id,
      items: orderItems,
      subtotal,
      deliveryFee: settings.deliveryFee,
      total: subtotal + settings.deliveryFee,
      paymentMethod: "cod",
      address: {
        name: address.name,
        phone: address.phone,
        address: address.address,
        note: address.note || "",
      },
      statusHistory: [{ status: "pending", by: req.user._id }],
    });

    notifyAdmins("order:new", order);
    res.status(201).json(order);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.json(orders);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = String(order.user?._id) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin")
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
};

exports.cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });

    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", by: req.user._id });
    await order.save();
    notifyAdmins("order:updated", order);
    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
};

/* ---------- Admin ---------- */

exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter)
      .populate("user", "name phone")
      .sort("-createdAt")
      .limit(100);
    res.json(orders);
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!FLOW[order.status].includes(status)) {
      return res
        .status(400)
        .json({ message: `Cannot change from ${order.status} to ${status}` });
    }

    order.status = status;
    order.statusHistory.push({ status, by: req.user._id });
    if (status === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }
    await order.save();

    notifyUser(order.user, "order:status", {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
    notifyAdmins("order:updated", order);

    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
};