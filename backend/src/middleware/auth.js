import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = async (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return res.status(401).json({ message: "No token" });
  const cookies = Object.fromEntries(cookieHeader.split(";").map(s=>s.trim().split("=")).map(([k,v])=>[k,decodeURIComponent(v)]));
  const token = cookies[process.env.COOKIE_NAME || "iwastoken"];
  if (!token) return res.status(401).json({ message: "No token" });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: "Invalid token" });
  const user = await User.findById(decoded.id).select("-password");
  if (!user) return res.status(401).json({ message: "User not found" });
  req.user = user;
  next();
};

export const adminMiddleware = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
    next();
  });
};
