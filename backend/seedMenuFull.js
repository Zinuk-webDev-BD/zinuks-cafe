require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const Category = require("./src/models/Category");
const MenuItem = require("./src/models/MenuItem");

const sizes = (regular, large) => [
  { name: "Regular", price: regular },
  { name: "Large", price: large },
];
const shot = [{ name: "Extra shot", price: 50 }];
const cheese = [{ name: "Extra cheese", price: 40 }];

const data = [
  {
    name: "Hot Coffee",
    items: [
      { name: "Espresso", price: 120, description: "A bold, rich single shot with a golden crema" },
      { name: "Americano", price: 150, description: "Espresso stretched with hot water, smooth and clean" },
      { name: "Cappuccino", price: 180, description: "Equal parts espresso, steamed milk and velvety foam", variants: sizes(180, 230), addOns: shot },
      { name: "Caffe Latte", price: 200, description: "Silky steamed milk poured over a double shot", variants: sizes(200, 250), addOns: shot },
      { name: "Mocha", price: 220, description: "Espresso and dark chocolate with steamed milk and cream", variants: sizes(220, 270), addOns: shot },
      { name: "Caramel Macchiato", price: 230, description: "Vanilla milk, espresso and a buttery caramel drizzle", variants: sizes(230, 280), addOns: shot },
    ],
  },
  {
    name: "Cold Drinks",
    items: [
      { name: "Cold Coffee", price: 220, description: "Chilled blended coffee with a scoop of ice cream" },
      { name: "Iced Latte", price: 230, description: "Espresso over ice with cold milk", variants: sizes(230, 280), addOns: shot },
      { name: "Lemon Iced Tea", price: 130, description: "Fresh lemon and black tea, served ice cold" },
      { name: "Mango Smoothie", price: 190, description: "Ripe mango blended thick and creamy" },
      { name: "Strawberry Milkshake", price: 230, description: "Fresh strawberries with ice cream and milk" },
      { name: "Oreo Shake", price: 250, description: "Crushed cookies, vanilla ice cream and whipped cream" },
    ],
  },
  {
    name: "Burgers & Sandwiches",
    items: [
      { name: "Club Sandwich", price: 280, description: "Toasted bread layered with chicken, egg and fresh veggies" },
      { name: "Chicken Burger", price: 320, description: "Crispy chicken patty, lettuce and house sauce", addOns: cheese },
      { name: "Beef Burger", price: 380, description: "Juicy grilled beef patty with caramelised onions", addOns: cheese },
      { name: "Chicken Wrap", price: 290, description: "Grilled chicken, crunchy slaw and garlic mayo in a warm wrap" },
    ],
  },
  {
    name: "Pasta & Pizza",
    items: [
      { name: "Creamy Alfredo Pasta", price: 350, description: "Chicken alfredo pasta served with garlic bread" },
      {
        name: "Margherita Pizza",
        price: 450,
        description: "Classic tomato, mozzarella and fresh basil",
        variants: [{ name: "Medium", price: 450 }, { name: "Large", price: 650 }],
        addOns: cheese,
      },
      {
        name: "Chicken Pizza",
        price: 520,
        description: "Roasted chicken, peppers and melted cheese",
        variants: [{ name: "Medium", price: 520 }, { name: "Large", price: 720 }],
        addOns: cheese,
      },
    ],
  },
  {
    name: "Snacks",
    items: [
      { name: "French Fries", price: 150, description: "Golden, crispy and lightly salted", addOns: [{ name: "Cheese dip", price: 30 }] },
      { name: "Chicken Nuggets", price: 220, description: "Crunchy bites with a smoky dipping sauce" },
      { name: "Onion Rings", price: 170, description: "Thick-cut rings in a crisp golden batter" },
      { name: "Garlic Bread", price: 160, description: "Toasted baguette with garlic butter and herbs" },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Chocolate Brownie", price: 160, description: "Warm, fudgy brownie with a crackly top" },
      { name: "Cheesecake Slice", price: 250, description: "Creamy baked cheesecake on a buttery biscuit base" },
      { name: "Tiramisu", price: 280, description: "Coffee-soaked layers with mascarpone and cocoa" },
      { name: "Chocolate Lava Cake", price: 260, description: "Molten chocolate centre, best eaten warm" },
      { name: "Waffle with Ice Cream", price: 300, description: "Crisp waffle, vanilla ice cream and chocolate sauce" },
      { name: "Croissant", price: 140, description: "Flaky, buttery and baked fresh every morning" },
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // সতর্কতা: আগের সব ক্যাটাগরি ও মেনু আইটেম মুছে নতুন করে বানায়
  await MenuItem.deleteMany({});
  await Category.deleteMany({});

  for (let i = 0; i < data.length; i++) {
    const cat = await Category.create({ name: data[i].name, order: i });
    await MenuItem.insertMany(
      data[i].items.map((item) => ({ ...item, category: cat._id }))
    );
  }

  console.log("Menu rebuilt:", await MenuItem.countDocuments(), "items");
  await mongoose.disconnect();
})();