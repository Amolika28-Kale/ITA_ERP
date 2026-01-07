const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI);

(async () => {
  const password = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin",
    email: "admin@erp.com",
    password
  });
  console.log("Admin created");
  process.exit();
})();
