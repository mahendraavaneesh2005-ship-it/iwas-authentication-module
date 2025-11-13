import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  try {
    console.log("Connecting to DB using URI:", process.env.MONGODB_URI);
    await connectDB(process.env.MONGODB_URI);  // Connect to MongoDB

    const email = (process.env.ADMIN_EMAIL || "admin@iwas.com").trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const password = process.env.ADMIN_PASSWORD || "Admin@123";
    const hash = await bcrypt.hash(password.trim(), 10);

    await User.create({ name: "Admin", email, password: hash, role: "admin" });

    console.log("Admin created:", email);
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
};

run();
