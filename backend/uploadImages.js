require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("./src/config/cloudinary");
const MenuItem = require("./src/models/MenuItem");

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const folder = path.join(__dirname, "seed-images");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await MenuItem.find();
  const files = fs
    .readdirSync(folder)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

  let done = 0;
  const missing = [];

  for (const item of items) {
    const file = files.find(
      (f) => path.parse(f).name.toLowerCase() === slug(item.name)
    );
    if (!file) {
      missing.push(slug(item.name));
      continue;
    }

    const result = await cloudinary.uploader.upload(path.join(folder, file), {
      folder: "zinuks-cafe/menu",
      public_id: slug(item.name),
      overwrite: true,
      transformation: [{ width: 900, height: 700, crop: "fill", gravity: "auto" }],
    });

    item.image = result.secure_url;
    await item.save();
    done++;
    console.log("Uploaded:", item.name);
  }

  console.log(`\nDone: ${done} uploaded`);
  if (missing.length) console.log("No photo yet for:", missing.join(", "));
  await mongoose.disconnect();
})();