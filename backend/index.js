   require("dotenv").config();
   const dns = require("dns");
   dns.setServers(["8.8.8.8", "1.1.1.1"]);
   const express = require("express");
   const cors = require("cors");
   const mongoose = require("mongoose");

   const app = express();
   app.use(cors());
   app.use(express.json());


   app.get("/", (req, res) => {
     res.json({ message: "Zinuk's Cafe Corner API is running" });
   });
   app.use("/api/v1/auth", require("./src/routes/authRoutes"));
   app.use("/api/v1/categories", require("./src/routes/categoryRoutes"));
app.use("/api/v1/menu", require("./src/routes/menuRoutes"));
app.use("/api/v1/settings", require("./src/routes/settingsRoutes"));
app.use("/api/v1/orders", require("./src/routes/orderRoutes"));
app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});
   const PORT = process.env.PORT || 8000;

   mongoose
     .connect(process.env.MONGO_URI)
     .then(() => console.log("MongoDB connected"))
     .catch((err) => console.error("MongoDB error:", err.message));

   app.listen(PORT, () => console.log("Server is running on: " + PORT));