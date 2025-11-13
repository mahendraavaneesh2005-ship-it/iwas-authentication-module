import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  
  const email = process.env.ADMIN_EMAIL || "Amar@gmail.com";
  const newPassword = "Amar@123";  // Set your new password here
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log("Admin user not found:", email);
    process.exit(1);
  }
  
  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  await user.save();
  
  console.log("Admin password updated for:", email);
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
