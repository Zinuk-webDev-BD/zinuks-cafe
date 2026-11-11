   require("dotenv").config();
   const dns = require("dns");
   dns.setServers(["8.8.8.8", "1.1.1.1"]);
   const mongoose = require("mongoose");
   const User = require("./src/models/User");

   (async () => {
     await mongoose.connect(process.env.MONGO_URI);
     const email = "admin@zinukscafe.com";
     const exists = await User.findOne({ email });
     if (exists) {
       console.log("Admin already exists");
     } else {
       await User.create({
         name: "Cafe Admin",
         email,
         password: "Admin@123",
         role: "admin",
       });
       console.log("Admin created:", email);
     }
     await mongoose.disconnect();
   })();