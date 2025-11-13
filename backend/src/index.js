import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import insuranceRoutes from "./routes/insuranceRoutes.js";
import healthInsuranceRoutes from "./routes/healthInsuranceRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/insurance", insuranceRoutes);  // Place here after middleware setup
app.use("/api/health", healthInsuranceRoutes);

app.get("/", (req, res) => res.send("IWAS Backend Running"));

// Connect DB and listen
try {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
} catch (err) {
  console.error("Failed to connect to DB or start server:", err);
  process.exit(1);
}
