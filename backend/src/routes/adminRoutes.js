import express from "express";
import { getUsers, updateRole } from "../controllers/adminController.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.get("/users", adminMiddleware, getUsers);
router.patch("/users/:id/role", adminMiddleware, updateRole);
export default router;
