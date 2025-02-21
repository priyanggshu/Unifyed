import express from "express";
import { getAllUsers, deleteUser, getChatStats } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.get("/stats", authMiddleware, adminMiddleware, getChatStats);

export default router;