import express from "express";
import { register, login, logout, me, updateProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateProfile);
export default router;
