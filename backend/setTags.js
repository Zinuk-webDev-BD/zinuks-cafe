require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const MenuItem = require("./src/models/MenuItem");

const veg = [
  "Espresso", "Americano", "Cappuccino", "Caffe Latte", "Mocha",
  "Caramel Macchiato", "Cold Coffee", "Iced Latte", "Lemon Iced Tea",
  "Mango Smoothie", "Strawberry Milkshake", "Oreo Shake", "Margherita Pizza",
  "French Fries", "Onion Rings", "Garlic Bread", "Chocolate Brownie",
  "Cheesecake Slice", "Tiramisu", "Chocolate Lava Cake",
  "Waffle with Ice Cream", "Croissant",
];
const popular = [
  "Cappuccino", "Caffe Latte", "Cold Coffee", "Chicken Burger",
  "Margherita Pizza", "French Fries", "Chocolate Brownie",
  "Strawberry Milkshake", "Chicken Wrap",
];
const spicy = ["Chicken Pizza", "Chicken Wrap", "Chicken Nuggets", "Beef Burger"];
const fresh = ["Waffle with Ice Cream", "Oreo Shake", "Tiramisu", "Chicken Wrap"];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await MenuItem.find();

  for (const item of items) {
    const tags = [];
    if (popular.includes(item.name)) tags.push("popular");
    if (veg.includes(item.name)) tags.push("veg");
    if (spicy.includes(item.name)) tags.push("spicy");
    if (fresh.includes(item.name)) tags.push("new");
    item.tags = tags;
    await item.save();
  }

  console.log(`Tags added to ${items.length} items`);
  await mongoose.disconnect();
})();