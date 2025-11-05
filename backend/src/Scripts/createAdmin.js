import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  const email = process.env.ADMIN_EMAIL || "admin@iwas.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
  await User.create({ name: "Admin", email, password: hash, role: "admin" });
  console.log("Admin created:", email);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
