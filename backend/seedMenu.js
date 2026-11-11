require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const Category = require("./src/models/Category");
const MenuItem = require("./src/models/MenuItem");

const data = [
  {
    name: "Coffee",
    items: [
      { name: "Espresso", price: 120, description: "Strong and bold single shot" },
      {
        name: "Cappuccino",
        price: 180,
        description: "Espresso with steamed milk foam",
        variants: [
          { name: "Regular", price: 180 },
          { name: "Large", price: 230 },
        ],
      },
      {
        name: "Caffe Latte",
        price: 200,
        description: "Smooth espresso with milk",
        variants: [
          { name: "Regular", price: 200 },
          { name: "Large", price: 250 },
        ],
        addOns: [{ name: "Extra shot", price: 50 }],
      },
      { name: "Cold Coffee", price: 220, description: "Iced blended coffee" },
    ],
  },
  {
    name: "Snacks",
    items: [
      { name: "Club Sandwich", price: 280, description: "Chicken, egg and veggies" },
      {
        name: "Chicken Burger",
        price: 320,
        description: "Crispy chicken patty with sauce",
        addOns: [{ name: "Extra cheese", price: 40 }],
      },
      { name: "French Fries", price: 150, description: "Crispy salted fries" },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Chocolate Brownie", price: 160, description: "Warm fudgy brownie" },
      { name: "Cheesecake Slice", price: 250, description: "Classic baked cheesecake" },
    ],
  },
  {
    name: "Beverages",
    items: [
      { name: "Lemon Iced Tea", price: 130, description: "Fresh and chilled" },
      { name: "Mango Smoothie", price: 190, description: "Made with fresh mango" },
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if (await Category.exists({})) {
    console.log("Menu already exists, skipping");
  } else {
    for (let i = 0; i < data.length; i++) {
      const cat = await Category.create({ name: data[i].name, order: i });
      await MenuItem.insertMany(
        data[i].items.map((item) => ({ ...item, category: cat._id }))
      );
    }
    console.log("Menu created");
  }
  await mongoose.disconnect();
})();