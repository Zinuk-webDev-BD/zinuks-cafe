   require("dotenv").config();
   const express = require("express");
   const cors = require("cors");
   const mongoose = require("mongoose");

   const app = express();
   app.use(cors());
   app.use(express.json());

   app.get("/", (req, res) => {
     res.json({ message: "Zinuk's Cafe Corner API is running" });
   });

   const PORT = process.env.PORT || 8000;

   mongoose
     .connect(process.env.MONGO_URI)
     .then(() => console.log("MongoDB connected"))
     .catch((err) => console.error("MongoDB error:", err.message));

   app.listen(PORT, () => console.log("Server is running on: " + PORT));